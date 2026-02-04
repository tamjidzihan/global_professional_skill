"""
Celery tasks for asynchronous operations.
"""

import logging
import secrets
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from .models import EmailVerificationToken, User

logger = logging.getLogger(__name__)


def send_verification_email(user_id):
    """Send verification email using template."""
    user = User.objects.get(id=user_id)
    # Generate token
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(hours=24)

    EmailVerificationToken.objects.create(user=user, token=token, expires_at=expires_at)

    # Prepare context
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    context = {
        "user": user,
        "site_name": settings.SITE_NAME,
        "site_url": settings.FRONTEND_URL,
        "verification_url": verification_url,
        "user_email": user.email,
    }

    # Render templates
    html_content = render_to_string("accounts/emails/verification_email.html", context)
    text_content = strip_tags(html_content)

    # Send email
    subject = f"Verify your email - {settings.SITE_NAME}"
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_password_reset_email(user_id):
    """Send password reset link to user with HTML template."""
    from .models import PasswordResetToken, User

    try:
        user = User.objects.get(id=user_id)

        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=1)

        # Delete existing tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()

        # Create new token
        PasswordResetToken.objects.create(user=user, token=token, expires_at=expires_at)

        # Create reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        # Prepare context for HTML template
        context = {
            "user": user,
            "site_name": settings.SITE_NAME,
            "site_url": settings.FRONTEND_URL,
            "reset_url": reset_url,
            "user_email": user.email,
            "email_subtitle": "Password Reset Request",
            "subject": f"Password Reset - {settings.SITE_NAME}",
        }

        # Render HTML email
        html_content = render_to_string(
            "accounts/emails/password_reset_email.html", context
        )
        text_content = strip_tags(html_content)

        # Send email with HTML alternative
        subject = f"Password Reset - {settings.SITE_NAME}"
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"Password reset email sent to {user.email}")
        return True

    except User.DoesNotExist:
        logger.error(f"User with id {user_id} does not exist")
        return False
    except Exception as exc:
        logger.error(f"Error sending password reset email: {str(exc)}")
        return False


def send_instructor_request_notification(request_id):
    """Notify admins about new instructor requests with HTML template."""
    from .models import InstructorRequest, User, UserRole

    try:
        request_obj = InstructorRequest.objects.get(id=request_id)
        admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)

        if not admins.exists():
            logger.warning(
                f"No active admins found to notify about request {request_id}"
            )
            return False

        # Prepare context
        context = {
            "request": request_obj,
            "site_name": settings.SITE_NAME,
            "site_url": settings.FRONTEND_URL,
            "admin_url": f"{settings.FRONTEND_URL}/admin/instructor-requests",
            "email_subtitle": "New Instructor Request",
            "subject": f"New Instructor Request - {settings.SITE_NAME}",
        }

        # Render HTML template once
        html_content = render_to_string(
            "accounts/emails/instructor_request_notification.html", context
        )
        text_content = strip_tags(html_content)

        # Send to each admin
        sent_count = 0
        for admin in admins:
            try:
                subject = f"New Instructor Request - {settings.SITE_NAME}"
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[admin.email],
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
                sent_count += 1
            except Exception as e:
                logger.error(
                    f"Failed to send notification to admin {admin.email}: {str(e)}"
                )

        logger.info(
            f"Instructor request notification sent for request {request_id} to {sent_count}/{admins.count()} admins"
        )
        return sent_count > 0

    except InstructorRequest.DoesNotExist:
        logger.error(f"Instructor request {request_id} does not exist")
        return False
    except Exception as exc:
        logger.error(f"Error sending instructor request notification: {str(exc)}")
        return False


def send_instructor_request_decision_email(request_id):
    """Notify user about instructor request decision with HTML template."""
    from .models import InstructorRequest

    try:
        request_obj = InstructorRequest.objects.get(id=request_id)
        user = request_obj.user

        # Prepare common context
        context = {
            "user": user,
            "site_name": settings.SITE_NAME,
            "site_url": settings.FRONTEND_URL,
            "user_email": user.email,
        }

        if request_obj.status == "APPROVED":
            # Approved email context
            context.update(
                {
                    "email_subtitle": "Instructor Request Approved",
                    "subject": f"Instructor Request Approved - {settings.SITE_NAME}",
                    "instructor_dashboard_url": f"{settings.FRONTEND_URL}/instructor/dashboard",
                }
            )

            # Render approved template
            template_name = "accounts/emails/instructor_approved.html"
        else:  # REJECTED or any other status
            # Rejected email context
            context.update(
                {
                    "email_subtitle": "Instructor Request Update",
                    "subject": f"Instructor Request Update - {settings.SITE_NAME}",
                    "review_notes": request_obj.review_notes,
                }
            )

            # Render rejected template
            template_name = "accounts/emails/instructor_rejected.html"

        # Render HTML email
        html_content = render_to_string(template_name, context)
        text_content = strip_tags(html_content)

        # Send email
        subject = context["subject"]
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(
            f"Decision email sent to {user.email} for request {request_id} (Status: {request_obj.status})"
        )
        return True

    except InstructorRequest.DoesNotExist:
        logger.error(f"Instructor request {request_id} does not exist")
        return False
    except Exception as exc:
        logger.error(f"Error sending decision email: {str(exc)}")
        return False

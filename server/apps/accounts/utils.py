"""
Utility functions for the accounts app.
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
import secrets
import logging

from .models import User, EmailVerificationToken, PasswordResetToken, InstructorRequest, UserRole

logger = logging.getLogger(__name__)


def generate_email_verification_token(user):
    """
    Generates a unique email verification token for a user.
    """
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS)
    EmailVerificationToken.objects.create(user=user, token=token, expires_at=expires_at)
    return token


def send_verification_email(user_id):
    """
    Sends an email verification link to the user.
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Invalidate any existing tokens for this user
        EmailVerificationToken.objects.filter(user=user).delete()
        
        token = generate_email_verification_token(user)
        
        # Build verification link
        verification_link = f"{settings.FRONTEND_BASE_URL}/verify-email?token={token}"
        
        subject = 'Verify Your Email Address for Learning Platform'
        html_message = render_to_string('emails/email_verification.html', {
            'user': user,
            'verification_link': verification_link,
            'token_expiry_hours': settings.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(subject, plain_message, from_email, [user.email], html_message=html_message)
        logger.info(f"Verification email sent to {user.email}")
        
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found for email verification.")
    except Exception as e:
        logger.error(f"Error sending verification email to user {user_id}: {e}", exc_info=True)


def generate_password_reset_token(user):
    """
    Generates a unique password reset token for a user.
    """
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRY_HOURS)
    PasswordResetToken.objects.create(user=user, token=token, expires_at=expires_at)
    return token


def send_password_reset_email(user_id):
    """
    Sends a password reset link to the user.
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Invalidate any existing unused tokens for this user
        PasswordResetToken.objects.filter(user=user, used=False).delete()
        
        token = generate_password_reset_token(user)
        
        # Build password reset link
        reset_link = f"{settings.FRONTEND_BASE_URL}/reset-password?token={token}"
        
        subject = 'Password Reset Request for Learning Platform'
        html_message = render_to_string('emails/password_reset.html', {
            'user': user,
            'reset_link': reset_link,
            'token_expiry_hours': settings.PASSWORD_RESET_TOKEN_EXPIRY_HOURS
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(subject, plain_message, from_email, [user.email], html_message=html_message)
        logger.info(f"Password reset email sent to {user.email}")
        
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found for password reset email.")
    except Exception as e:
        logger.error(f"Error sending password reset email to user {user_id}: {e}", exc_info=True)


def send_instructor_request_notification(instructor_request_id):
    """
    Sends a notification email to all admin users about a new instructor request.
    """
    try:
        instructor_request = InstructorRequest.objects.get(id=instructor_request_id)
        user = instructor_request.user
        admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)
        admin_emails = [admin.email for admin in admins]
        
        if not admin_emails:
            logger.warning("No active admin users found to send instructor request notification.")
            return

        # Assuming an admin dashboard for reviewing requests
        admin_review_link = f"{settings.FRONTEND_BASE_URL}/admin/instructor-requests/{instructor_request.id}/review"
        
        subject = 'New Instructor Request Submitted'
        html_message = render_to_string('emails/instructor_notification.html', {
            'instructor_request': instructor_request,
            'user': user,
            'admin_review_link': admin_review_link
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(subject, plain_message, from_email, admin_emails, html_message=html_message)
        logger.info(f"Instructor request notification sent for {user.email} to admins: {admin_emails}")
        
    except InstructorRequest.DoesNotExist:
        logger.error(f"InstructorRequest with ID {instructor_request_id} not found for notification.")
    except Exception as e:
        logger.error(f"Error sending instructor request notification for {instructor_request_id}: {e}", exc_info=True)


def send_instructor_request_decision_email(instructor_request_id):
    """
    Sends an email to the user informing them about the decision on their instructor request.
    """
    try:
        instructor_request = InstructorRequest.objects.get(id=instructor_request_id)
        user = instructor_request.user
        
        subject = f'Your Instructor Request has been {instructor_request.status}'
        html_message = render_to_string('emails/instructor_decision.html', {
            'instructor_request': instructor_request,
            'user': user,
            'status': instructor_request.status,
            'review_notes': instructor_request.review_notes
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(subject, plain_message, from_email, [user.email], html_message=html_message)
        logger.info(f"Instructor request decision email sent to {user.email} with status {instructor_request.status}")
        
    except InstructorRequest.DoesNotExist:
        logger.error(f"InstructorRequest with ID {instructor_request_id} not found for decision email.")
    except Exception as e:
        logger.error(f"Error sending instructor request decision email for {instructor_request_id}: {e}", exc_info=True)
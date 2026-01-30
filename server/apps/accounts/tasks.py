"""
Celery tasks for asynchronous operations.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.template.loader import render_to_string
from datetime import timedelta
import secrets
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_verification_email(self, user_id):
    """Send email verification link to user."""
    from .models import User, EmailVerificationToken
    
    try:
        user = User.objects.get(id=user_id)
        
        # Generate verification token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Create verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        # Email content
        subject = f"Verify your email - {settings.SITE_NAME}"
        message = f"""
        Hello {user.get_full_name()},
        
        Thank you for registering with {settings.SITE_NAME}!
        
        Please verify your email address by clicking the link below:
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        
        Best regards,
        {settings.SITE_NAME} Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Verification email sent to {user.email}")
        return f"Verification email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} does not exist")
        return f"User with id {user_id} does not exist"
    except Exception as exc:
        logger.error(f"Error sending verification email: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id):
    """Send password reset link to user."""
    from .models import User, PasswordResetToken
    
    try:
        user = User.objects.get(id=user_id)
        
        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=1)
        
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Create reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        # Email content
        subject = f"Password Reset - {settings.SITE_NAME}"
        message = f"""
        Hello {user.get_full_name()},
        
        You requested to reset your password for {settings.SITE_NAME}.
        
        Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        {settings.SITE_NAME} Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent to {user.email}")
        return f"Password reset email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} does not exist")
        return f"User with id {user_id} does not exist"
    except Exception as exc:
        logger.error(f"Error sending password reset email: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task
def send_instructor_request_notification(request_id):
    """Notify admins about new instructor requests."""
    from .models import InstructorRequest, User, UserRole
    
    try:
        request_obj = InstructorRequest.objects.get(id=request_id)
        admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)
        
        for admin in admins:
            subject = f"New Instructor Request - {settings.SITE_NAME}"
            message = f"""
            Hello {admin.get_full_name()},
            
            A new instructor role request has been submitted by {request_obj.user.get_full_name()} ({request_obj.user.email}).
            
            Please review the request in the admin panel.
            
            Best regards,
            {settings.SITE_NAME} System
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=True,
            )
        
        logger.info(f"Instructor request notification sent for request {request_id}")
        return f"Notifications sent to {admins.count()} admins"
        
    except InstructorRequest.DoesNotExist:
        logger.error(f"Instructor request {request_id} does not exist")
        return f"Request {request_id} does not exist"
    except Exception as exc:
        logger.error(f"Error sending instructor request notification: {str(exc)}")
        return str(exc)


@shared_task
def send_instructor_request_decision_email(request_id):
    """Notify user about instructor request decision."""
    from .models import InstructorRequest
    
    try:
        request_obj = InstructorRequest.objects.get(id=request_id)
        user = request_obj.user
        
        if request_obj.status == 'APPROVED':
            subject = f"Instructor Request Approved - {settings.SITE_NAME}"
            message = f"""
            Hello {user.get_full_name()},
            
            Congratulations! Your instructor role request has been approved.
            
            You can now create and manage courses on {settings.SITE_NAME}.
            
            Best regards,
            {settings.SITE_NAME} Team
            """
        else:  # REJECTED
            subject = f"Instructor Request Update - {settings.SITE_NAME}"
            message = f"""
            Hello {user.get_full_name()},
            
            Thank you for your interest in becoming an instructor on {settings.SITE_NAME}.
            
            After careful review, we are unable to approve your request at this time.
            
            {f"Review notes: {request_obj.review_notes}" if request_obj.review_notes else ""}
            
            You may submit a new request in the future.
            
            Best regards,
            {settings.SITE_NAME} Team
            """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Decision email sent to {user.email} for request {request_id}")
        return f"Decision email sent to {user.email}"
        
    except InstructorRequest.DoesNotExist:
        logger.error(f"Instructor request {request_id} does not exist")
        return f"Request {request_id} does not exist"
    except Exception as exc:
        logger.error(f"Error sending decision email: {str(exc)}")
        return str(exc)

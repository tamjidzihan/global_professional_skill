import logging
import requests
from django.conf import settings
from django.core.mail import send_mail
from .models import (
    SiteSettings,
    NotificationTemplate,
    NotificationLog,
    NotificationChannel,
    NotificationTypeCode,
)

logger = logging.getLogger(__name__)

# Default templates fallback dictionary
DEFAULT_TEMPLATES = {
    NotificationTypeCode.SMS_REGISTRATION_VERIFICATION: {
        "channel": NotificationChannel.SMS,
        "name": "Registration Verification Link (SMS)",
        "subject": "",
        "body": "Global Professional Skill: আপনার অ্যাকাউন্ট যাচাই করতে নিচের লিংকে ক্লিক করুন: [Verification Link]",
    },
    NotificationTypeCode.SMS_STUDENT_VERIFICATION: {
        "channel": NotificationChannel.SMS,
        "name": "Student Verification (SMS)",
        "subject": "",
        "body": "Global Professional Institute এ অ্যাকাউন্ট করার জন্য ধন্যবাদ ।ভিজিট: gpibd.com",
    },
    NotificationTypeCode.SMS_COURSE_APPROVAL: {
        "channel": NotificationChannel.SMS,
        "name": "Course Purchase Approval (SMS)",
        "subject": "",
        "body": "[কোর্সের নাম] কোর্সে ভর্তির জন্য ধন্যবাদ ।ভিজিট: gpibd.com",
    },
    NotificationTypeCode.SMS_QUIZ_RESULT_PASS: {
        "channel": NotificationChannel.SMS,
        "name": "Quiz Result Pass (SMS)",
        "subject": "",
        "body": "অভিনন্দন! [কুইজের নাম] কোর্সে আপনার স্কোর: [স্কোর]%. ভিজিট: gpibd.com",
    },
    NotificationTypeCode.SMS_QUIZ_RESULT_FAIL: {
        "channel": NotificationChannel.SMS,
        "name": "Quiz Result Fail (SMS)",
        "subject": "",
        "body": " [কুইজের নাম] কোর্সে আপনার স্কোর: [স্কোর]%. আবার চেষ্টা করুন। ভিজিট: gpibd.com",
    },
    NotificationTypeCode.EMAIL_STUDENT_VERIFICATION: {
        "channel": NotificationChannel.EMAIL,
        "name": "Student Verification Confirmation (Email)",
        "subject": "Your GPI Account Has Been Verified",
        "body": "Dear [Student Name], your account at Global Professional Institute (GPI) has been successfully verified. visit  gpibd.com",
    },
    NotificationTypeCode.EMAIL_COURSE_PURCHASE: {
        "channel": NotificationChannel.EMAIL,
        "name": "Course Purchase Confirmation (Email)",
        "subject": "Course Purchase Confirmation — GPI",
        "body": "Dear [Student Name], thank you for purchasing [Course Name]. Your payment has been received and is pending admin approval. You will receive a confirmation email once approved. — gpibd.com",
    },
    NotificationTypeCode.EMAIL_COURSE_APPROVAL: {
        "channel": NotificationChannel.EMAIL,
        "name": "Course Approval Confirmation (Email)",
        "subject": "Your Course Enrollment Has Been Approved — GPI",
        "body": "Dear [Student Name], your enrollment for [Course Name] has been approved by the admin. You can now access all course materials from your student dashboard. Happy learning! — gpibd.com",
    },
    NotificationTypeCode.EMAIL_INSTRUCTOR_ANNOUNCEMENT: {
        "channel": NotificationChannel.EMAIL,
        "name": "Instructor Announcement (Email)",
        "subject": "New Announcement from [Instructor Name] — [Course Name]",
        "body": "[Announcement Content] — Global Professional Institute (gpibd.com)",
    },
    NotificationTypeCode.EMAIL_ADMIN_ANNOUNCEMENT: {
        "channel": NotificationChannel.EMAIL,
        "name": "Admin Announcement (Email)",
        "subject": "Important Announcement from GPI Admin",
        "body": "[Announcement Content] — Global Professional Institute (gpibd.com)",
    },
    NotificationTypeCode.EMAIL_COURSE_COMPLETION: {
        "channel": NotificationChannel.EMAIL,
        "name": "Course Completion Confirmation (Email)",
        "subject": "Congratulations! You've Completed [Course Name] — GPI",
        "body": "Dear [Student Name], congratulations on successfully completing [Course Name]! Your certificate is now available for download from your student dashboard. — Global Professional Institute (gpibd.com)",
    },
}


def format_phone_number(phone: str) -> str:
    """
    Format user phone number for Bangladesh SMS.
    Rules:
    - If phone doesn't start with +88, add it.
    - Handle numbers starting with 880 or 01.
    """
    if not phone:
        return ""
    
    cleaned = str(phone).strip().replace(" ", "").replace("-", "")
    
    if cleaned.startswith("+88"):
        return cleaned
    elif cleaned.startswith("88"):
        return f"+{cleaned}"
    elif cleaned.startswith("0"):
        return f"+88{cleaned}"
    else:
        return f"+88{cleaned}"


def render_template(text: str, context: dict) -> str:
    """
    Substitute placeholders in subject or body text.
    Handles both English dynamic keys like [Student Name], [Course Name]
    and Bangla dynamic keys like [কোর্সের নাম], [কুইজের নাম], [স্কোর].
    """
    if not text:
        return ""

    result = str(text)

    # Key mappings dictionary
    replacements = {
        "[Student Name]": context.get("student_name", context.get("user_name", "Student")),
        "[Course Name]": context.get("course_name", ""),
        "[কোর্সের নাম]": context.get("course_name", ""),
        "[Quiz Name]": context.get("quiz_name", ""),
        "[কুইজের নাম]": context.get("quiz_name", ""),
        "[Score]": str(context.get("score", "")),
        "[স্কোর]": str(context.get("score", "")),
        "[Instructor Name]": context.get("instructor_name", "Instructor"),
        "[Announcement Content]": context.get("announcement_content", ""),
        "[Site Name]": getattr(settings, "SITE_NAME", "Global Professional Institute"),
        "[Frontend URL]": getattr(settings, "FRONTEND_URL", ""),
        "[Verification Link]": context.get("verification_url", context.get("verification_link", "")),
        "[verification_url]": context.get("verification_url", context.get("verification_link", "")),
        "[verification_link]": context.get("verification_url", context.get("verification_link", "")),
        "{verification_link}": context.get("verification_url", context.get("verification_link", "")),
        "[লিংক]": context.get("verification_url", context.get("verification_link", "")),
    }

    for placeholder, val in replacements.items():
        if placeholder in result:
            result = result.replace(placeholder, str(val))

    return result


def send_greenweb_sms(phone: str, message_text: str) -> dict:
    """
    Send SMS via Greenweb BD API (http://api.greenweb.com.bd/api.php).
    Format:
    data = {'token': token, 'to': phone_with_88, 'message': message}
    """
    formatted_phone = format_phone_number(phone)
    if not formatted_phone:
        return {"success": False, "response": "No valid phone number provided", "formatted_phone": ""}

    settings_obj = SiteSettings.get_settings()
    token = (
        getattr(settings, "GREENWEB_SMS_TOKEN", None)
        or settings_obj.greenweb_sms_token
        or getattr(settings, "SMS_TOKEN", None)
    )

    if not token or token == "XXXXXXXXXXXXXXXXX":
        safe_msg = message_text.encode("ascii", errors="backslashreplace").decode("ascii")
        logger.warning(
            f"[SMS MOCK / NO TOKEN SET] Target: {formatted_phone}\nMessage: {safe_msg}"
        )
        return {
            "success": True,
            "response": "NO_TOKEN_SET_MOCK_SUCCESS",
            "formatted_phone": formatted_phone,
        }

    greenweb_url = "http://api.greenweb.com.bd/api.php"
    payload = {
        "token": token,
        "to": formatted_phone,
        "message": message_text,
    }

    try:
        response = requests.post(url=greenweb_url, data=payload, timeout=15)
        response_text = response.text
        safe_resp = response_text.encode("ascii", errors="backslashreplace").decode("ascii")
        logger.info(f"Greenweb SMS sent to {formatted_phone}. Response: {safe_resp}")
        return {
            "success": response.status_code == 200,
            "response": response_text,
            "formatted_phone": formatted_phone,
        }
    except Exception as e:
        safe_err = str(e).encode("ascii", errors="backslashreplace").decode("ascii")
        logger.error(f"Failed to send Greenweb SMS to {formatted_phone}: {safe_err}")
        return {
            "success": False,
            "response": str(e),
            "formatted_phone": formatted_phone,
        }


def dispatch_notification(
    code: str,
    user=None,
    email: str = None,
    phone: str = None,
    context: dict = None,
) -> bool:
    """
    Central dispatcher to send SMS or Email notifications based on type code.
    Looks up template in DB first; falls back to DEFAULT_TEMPLATES if missing.
    """
    context = context or {}

    # Extract email and phone from user if provided
    if user:
        if not email:
            email = getattr(user, "email", "")
        if not phone:
            phone = getattr(user, "phone_number", "")
        if "student_name" not in context and hasattr(user, "get_full_name"):
            context["student_name"] = user.get_full_name() or user.email

    # Try to find template in DB
    template_obj = NotificationTemplate.objects.filter(code=code, is_active=True).first()

    if template_obj:
        channel = template_obj.channel
        raw_subject = template_obj.subject
        raw_body = template_obj.template_body
    elif code in DEFAULT_TEMPLATES:
        fallback = DEFAULT_TEMPLATES[code]
        channel = fallback["channel"]
        raw_subject = fallback["subject"]
        raw_body = fallback["body"]
    else:
        logger.error(f"Unknown notification code: {code}")
        return False

    rendered_subject = render_template(raw_subject, context)
    rendered_body = render_template(raw_body, context)

    success = False
    response_info = ""

    if channel == NotificationChannel.SMS:
        if not phone:
            logger.warning(f"Skipping SMS ({code}): No phone number available for user {user}")
            return False
        
        result = send_greenweb_sms(phone, rendered_body)
        success = result["success"]
        response_info = result["response"]
        target_phone = result["formatted_phone"]

        # Log entry
        NotificationLog.objects.create(
            recipient_user=user if getattr(user, "id", None) else None,
            recipient_email=email or "",
            recipient_phone=target_phone,
            channel=NotificationChannel.SMS,
            notification_type=code,
            subject="",
            body=rendered_body,
            status="SENT" if success else "FAILED",
            response_data=response_info,
        )

    elif channel == NotificationChannel.EMAIL:
        if not email:
            logger.warning(f"Skipping Email ({code}): No email address available for user {user}")
            return False

        try:
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@gpibd.com")
            send_mail(
                subject=rendered_subject,
                message=rendered_body,
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
            )
            success = True
            response_info = "Email sent via SMTP successfully."
        except Exception as e:
            logger.error(f"Failed to send email ({code}) to {email}: {str(e)}")
            success = False
            response_info = str(e)

        # Log entry
        NotificationLog.objects.create(
            recipient_user=user if getattr(user, "id", None) else None,
            recipient_email=email,
            recipient_phone=phone or "",
            channel=NotificationChannel.EMAIL,
            notification_type=code,
            subject=rendered_subject,
            body=rendered_body,
            status="SENT" if success else "FAILED",
            response_data=response_info,
        )

    return success

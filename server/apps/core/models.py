from django.db import models
import uuid

class SiteSettings(models.Model):
    """Global settings for the platform, such as payment details."""
    
    # bKash Settings
    bkash_merchant_number = models.CharField(
        max_length=20, 
        default="01XXXXXXXXX",
        help_text="The bKash merchant number students should pay to."
    )
    bkash_qr_code = models.ImageField(
        upload_to='settings/payment/',
        blank=True,
        null=True,
        help_text="Upload the bKash QR code image."
    )
    
    # Greenweb SMS & Quiz Pass Settings
    quiz_pass_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.0,
        help_text="Passing score percentage for quizzes (e.g. 40, 50, 60)"
    )
    greenweb_sms_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Token for Greenweb BD SMS API"
    )
    
    # Metadata for singleton pattern
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Global Site Settings"

    @classmethod
    def get_settings(cls):
        """Helper to get the singleton settings object."""
        settings, created = cls.objects.get_or_create(id=1)
        return settings

class Announcement(models.Model):
    """Model for site-wide announcements."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_visible = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True, help_text="When to start showing the announcement")
    end_date = models.DateTimeField(null=True, blank=True, help_text="When to stop showing the announcement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='announcements')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class NewsTickerItem(models.Model):
    """Model for site-wide news ticker items."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=255)
    link = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional URL to open when the ticker item is clicked.",
    )
    color = models.CharField(
        max_length=20,
        default="bg-[#3B5EF5]",
        help_text="Tailwind background color class for the ticker bullet",
    )
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    start_date = models.DateTimeField(null=True, blank=True, help_text="When to start showing the ticker item")
    end_date = models.DateTimeField(null=True, blank=True, help_text="When to stop showing the ticker item")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='news_ticker_items'
    )

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.text


class NotificationChannel(models.TextChoices):
    SMS = "SMS", "SMS"
    EMAIL = "EMAIL", "Email"


class NotificationTypeCode(models.TextChoices):
    # SMS (Bangla)
    SMS_STUDENT_VERIFICATION = "SMS_STUDENT_VERIFICATION", "SMS - Student Verification"
    SMS_COURSE_APPROVAL = "SMS_COURSE_APPROVAL", "SMS - Course Purchase Approval"
    SMS_QUIZ_RESULT_PASS = "SMS_QUIZ_RESULT_PASS", "SMS - Quiz Result (Pass)"
    SMS_QUIZ_RESULT_FAIL = "SMS_QUIZ_RESULT_FAIL", "SMS - Quiz Result (Fail)"
    
    # Email (English)
    EMAIL_STUDENT_VERIFICATION = "EMAIL_STUDENT_VERIFICATION", "Email - Student Verification"
    EMAIL_COURSE_PURCHASE = "EMAIL_COURSE_PURCHASE", "Email - Course Purchase Confirmation"
    EMAIL_COURSE_APPROVAL = "EMAIL_COURSE_APPROVAL", "Email - Course Approval Confirmation"
    EMAIL_INSTRUCTOR_ANNOUNCEMENT = "EMAIL_INSTRUCTOR_ANNOUNCEMENT", "Email - Instructor Announcement"
    EMAIL_ADMIN_ANNOUNCEMENT = "EMAIL_ADMIN_ANNOUNCEMENT", "Email - Admin Announcement"
    EMAIL_COURSE_COMPLETION = "EMAIL_COURSE_COMPLETION", "Email - Course Completion Confirmation"


class NotificationTemplate(models.Model):
    """Customizable SMS and Email notification templates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, choices=NotificationTypeCode.choices, unique=True, db_index=True)
    channel = models.CharField(max_length=10, choices=NotificationChannel.choices, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    subject = models.CharField(max_length=255, blank=True, help_text="Email Subject line (ignored for SMS)")
    template_body = models.TextField(help_text="Body content with variables like [Student Name], [Course Name], [Score], etc.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notification_templates"
        verbose_name = "Notification Template"
        verbose_name_plural = "Notification Templates"
        ordering = ["code"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class NotificationLog(models.Model):
    """Log of all sent SMS and Email notifications."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_user = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='notification_logs'
    )
    recipient_email = models.CharField(max_length=255, blank=True)
    recipient_phone = models.CharField(max_length=50, blank=True)
    channel = models.CharField(max_length=10, choices=NotificationChannel.choices, db_index=True)
    notification_type = models.CharField(max_length=50, choices=NotificationTypeCode.choices, db_index=True)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    status = models.CharField(max_length=20, default="SENT", choices=[("SENT", "Sent"), ("FAILED", "Failed")], db_index=True)
    response_data = models.TextField(blank=True, help_text="API response or error stack")
    sent_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "notification_logs"
        verbose_name = "Notification Log"
        verbose_name_plural = "Notification Logs"
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.channel} to {self.recipient_email or self.recipient_phone} ({self.status})"


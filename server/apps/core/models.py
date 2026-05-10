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

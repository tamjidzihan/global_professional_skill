from django.db import models

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

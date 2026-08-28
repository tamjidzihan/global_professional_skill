import uuid
from django.db import models
from apps.accounts.models import User
from apps.courses.models import Course


class PaymentStatus(models.TextChoices):
    """Payment status choices."""

    PENDING = "PENDING", "Pending"
    COMPLETED = "COMPLETED", "Completed"
    FAILED = "FAILED", "Failed"
    REFUNDED = "REFUNDED", "Refunded"


class Payment(models.Model):
    """Model to track course payments."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payments"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="payments"
    )
    
    # Amount details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    
    # Transaction identifiers (from providers like Stripe/PayPal)
    transaction_id = models.CharField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True, 
        db_index=True,
        help_text="Transaction ID from the payment provider"
    )
    provider_order_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Order ID/Payment Intent ID from the provider"
    )
    payment_method = models.CharField(
        max_length=50, 
        blank=True,
        help_text="e.g., Credit Card, PayPal, etc."
    )
    sender_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="The phone number the student used to send the payment (e.g., bKash number)"
    )
    
    # Metadata for additional context
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["course", "status"]),
        ]

    def __str__(self):
        return f"Payment {self.id} - {self.user.email} - {self.status}"

    @property
    def is_completed(self):
        """Check if payment is completed."""
        return self.status == PaymentStatus.COMPLETED


class PromoCode(models.Model):
    """Model to store discount promo codes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Discount percentage (e.g. 10.0 for 10%, 50.0 for 50%)"
    )
    valid_from = models.DateTimeField(help_text="Start date/time of validity")
    valid_until = models.DateTimeField(help_text="Expiration date/time")
    max_uses = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum total redemptions allowed (leave blank for unlimited)"
    )
    uses_count = models.PositiveIntegerField(default=0, help_text="Total number of times used")
    is_active = models.BooleanField(default=True, help_text="Enable or disable promo code")
    courses = models.ManyToManyField(
        Course,
        blank=True,
        related_name="promo_codes",
        help_text="Select courses eligible for this promo code (leave blank to apply to all courses)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "promo_codes"
        verbose_name = "Promo Code"
        verbose_name_plural = "Promo Codes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.upper().strip()
        super().save(*args, **kwargs)

    def is_valid_now(self, course=None):
        """Check if promo code is active, within duration window, under max uses, and applicable for course."""
        from django.utils import timezone
        now = timezone.now()

        if not self.is_active:
            return False, "Promo code is inactive."

        if self.valid_from and now < self.valid_from:
            return False, "Promo code is not yet active."

        if self.valid_until and now > self.valid_until:
            return False, "Promo code has expired."

        if self.max_uses and self.uses_count >= self.max_uses:
            return False, "Promo code usage limit reached."

        if course and self.courses.exists() and not self.courses.filter(id=course.id).exists():
            return False, "Promo code is not applicable for this course."

        return True, "Promo code is valid."


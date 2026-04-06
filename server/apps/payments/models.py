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

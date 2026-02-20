from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""

    list_display = (
        "id",
        "user",
        "course",
        "amount",
        "currency",
        "status",
        "created_at",
        "completed_at",
    )
    list_filter = ("status", "currency", "payment_method", "created_at")
    search_fields = (
        "id",
        "user__email",
        "course__title",
        "transaction_id",
        "provider_order_id",
    )
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("id", "user", "course", "amount", "currency", "status")},
        ),
        (
            "Payment Details",
            {
                "fields": (
                    "transaction_id",
                    "provider_order_id",
                    "payment_method",
                    "metadata",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at", "completed_at")},
        ),
    )

from django.contrib import admin
from .models import Payment, PromoCode


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


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    """Admin configuration for PromoCode model."""

    list_display = (
        "code",
        "discount_percentage",
        "valid_from",
        "valid_until",
        "max_uses",
        "uses_count",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "valid_from", "valid_until")
    search_fields = ("code",)
    readonly_fields = ("id", "uses_count", "created_at", "updated_at")
    filter_horizontal = ("courses",)


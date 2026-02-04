"""
Django admin configuration for accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, InstructorRequest, EmailVerificationToken, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""

    list_display = (
        "email",
        "full_name_display",
        "role",
        "email_verified",
        "is_active",
        "date_joined",
    )
    list_filter = ("role", "is_active", "email_verified", "is_staff", "date_joined")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "bio",
                    "profile_picture",
                    "phone_number",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "email_verified",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "role",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

    readonly_fields = ("date_joined", "last_login")

    def full_name_display(self, obj):
        return obj.get_full_name()

    full_name_display.short_description = "Full Name"  # type: ignore

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related()

    actions = ["activate_users", "deactivate_users", "make_instructor", "make_student"]

    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} user(s) activated successfully.")

    activate_users.short_description = "Activate selected users"  # type: ignore

    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} user(s) deactivated successfully.")

    deactivate_users.short_description = "Deactivate selected users"  # type: ignore

    def make_instructor(self, request, queryset):
        count = queryset.update(role="INSTRUCTOR")
        self.message_user(request, f"{count} user(s) promoted to Instructor.")

    make_instructor.short_description = "Promote to Instructor"  # type: ignore

    def make_student(self, request, queryset):
        count = queryset.update(role="STUDENT")
        self.message_user(request, f"{count} user(s) changed to Student.")

    make_student.short_description = "Change to Student"  # type: ignore


@admin.register(InstructorRequest)
class InstructorRequestAdmin(admin.ModelAdmin):
    """Admin for InstructorRequest model."""

    list_display = (
        "user_email",
        "user_name",
        "status",
        "created_at",
        "reviewed_by",
        "reviewed_at",
    )
    list_filter = ("status", "created_at", "reviewed_at")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    ordering = ("-created_at",)
    list_editable = ["status"]

    fieldsets = (
        ("User Information", {"fields": ("user",)}),
        (
            "Request Details",
            {"fields": ("reason", "qualifications", "teaching_interests")},
        ),
        ("Status", {"fields": ("status", "review_notes")}),
        ("Review Information", {"fields": ("reviewed_by", "reviewed_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    readonly_fields = ("created_at", "updated_at", "reviewed_at", "reviewed_by")

    def user_email(self, obj):
        return obj.user.email

    user_email.short_description = "User Email"  # type: ignore

    def user_name(self, obj):
        return obj.user.get_full_name()

    user_name.short_description = "User Name"  # type: ignore

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("user", "reviewed_by")

    actions = ["approve_requests", "reject_requests"]

    def approve_requests(self, request, queryset):
        from django.utils import timezone
        from .tasks import send_instructor_request_decision_email

        for req in queryset.filter(status="PENDING"):
            req.status = "APPROVED"
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save()

            # Update user role
            req.user.role = "INSTRUCTOR"
            req.user.save()

            # Send notification
            send_instructor_request_decision_email(str(req.id))

        self.message_user(request, f"{queryset.count()} request(s) approved.")

    approve_requests.short_description = "Approve selected requests"  # type: ignore

    def reject_requests(self, request, queryset):
        from django.utils import timezone
        from .tasks import send_instructor_request_decision_email

        for req in queryset.filter(status="PENDING"):
            req.status = "REJECTED"
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save()

            # Send notification
            send_instructor_request_decision_email(str(req.id))

        self.message_user(request, f"{queryset.count()} request(s) rejected.")

    reject_requests.short_description = "Reject selected requests"  # type: ignore


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin for EmailVerificationToken model."""

    list_display = ("user", "created_at", "expires_at", "is_expired_display")
    list_filter = ("created_at", "expires_at")
    search_fields = ("user__email", "token")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    def is_expired_display(self, obj):
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')

    is_expired_display.short_description = "Status"  # type: ignore


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin for PasswordResetToken model."""

    list_display = ("user", "created_at", "expires_at", "used", "is_expired_display")
    list_filter = ("created_at", "expires_at", "used")
    search_fields = ("user__email", "token")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    def is_expired_display(self, obj):
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired/Used</span>')
        return format_html('<span style="color: green;">Valid</span>')

    is_expired_display.short_description = "Status"  # type: ignore

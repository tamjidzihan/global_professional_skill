"""
Django admin configuration for careers app.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Job, JobApplication, JobType, JobApplicationStatus


class JobApplicationInline(admin.TabularInline):
    model = JobApplication
    extra = 0
    can_delete = True
    fields = ("applicant_display", "status_badge", "cv_file_link", "applied_at")
    readonly_fields = ("applicant_display", "status_badge", "cv_file_link", "applied_at")
    show_change_link = True

    def applicant_display(self, obj):
        if not obj or not obj.user:
            return "-"
        name = obj.user.get_full_name() or obj.user.email
        return format_html("<strong>{}</strong> ({})", name, obj.user.email)

    applicant_display.short_description = "Applicant"

    def status_badge(self, obj):
        colors = {
            JobApplicationStatus.PENDING: ("#92400e", "#fef3c7"),
            JobApplicationStatus.REVIEWED: ("#1e40af", "#dbeafe"),
            JobApplicationStatus.ACCEPTED: ("#065f46", "#d1fae5"),
            JobApplicationStatus.REJECTED: ("#991b1b", "#fee2e2"),
        }
        text_color, bg_color = colors.get(obj.status, ("#374151", "#f3f4f6"))
        return format_html(
            '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: {}; background-color: {};">{}</span>',
            text_color,
            bg_color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"

    def cv_file_link(self, obj):
        if obj.cv_file:
            return format_html(
                '<a href="{}" target="_blank" style="color: #2563eb; font-weight: 500; text-decoration: underline;">📄 View CV</a>',
                obj.cv_file.url,
            )
        return format_html('<span style="color: #9ca3af;">No CV</span>')

    cv_file_link.short_description = "CV"


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "job_type_badge",
        "location",
        "salary_range",
        "closing_date_display",
        "is_active_badge",
        "applications_count",
        "created_at",
    )
    list_filter = ("is_active", "job_type", "location", "closing_date", "created_at")
    search_fields = ("title", "description", "requirements", "location", "salary_range")
    readonly_fields = ("id", "applications_count", "created_at", "updated_at")
    inlines = [JobApplicationInline]
    actions = ["make_active", "make_inactive"]

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "id",
                    "title",
                    "job_type",
                    "location",
                    "is_active",
                )
            },
        ),
        (
            "Job Details",
            {
                "fields": (
                    "description",
                    "requirements",
                )
            },
        ),
        (
            "Compensation & Timeline",
            {
                "fields": (
                    "salary_range",
                    "closing_date",
                )
            },
        ),
        (
            "Statistics & Timestamps",
            {
                "fields": (
                    "applications_count",
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    def job_type_badge(self, obj):
        colors = {
            JobType.FULL_TIME: ("#1e40af", "#dbeafe"),
            JobType.PART_TIME: ("#6b21a8", "#f3e8ff"),
            JobType.CONTRACT: ("#9a3412", "#ffedd5"),
            JobType.INTERNSHIP: ("#065f46", "#d1fae5"),
        }
        text_color, bg_color = colors.get(obj.job_type, ("#374151", "#f3f4f6"))
        return format_html(
            '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: {}; background-color: {};">{}</span>',
            text_color,
            bg_color,
            obj.get_job_type_display(),
        )

    job_type_badge.short_description = "Job Type"
    job_type_badge.admin_order_field = "job_type"

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #065f46; background-color: #d1fae5;">● Active</span>'
            )
        return format_html(
            '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #991b1b; background-color: #fee2e2;">○ Inactive</span>'
        )

    is_active_badge.short_description = "Status"
    is_active_badge.admin_order_field = "is_active"

    def closing_date_display(self, obj):
        if not obj.closing_date:
            return format_html('<span style="color: #6b7280;">No deadline</span>')

        today = timezone.now().date()
        if obj.closing_date < today:
            return format_html(
                '<span style="color: #dc2626; font-weight: 500;">{} (Expired)</span>',
                obj.closing_date,
            )
        days_left = (obj.closing_date - today).days
        if days_left <= 3:
            return format_html(
                '<span style="color: #d97706; font-weight: 600;">{} ({} days left!)</span>',
                obj.closing_date,
                days_left,
            )
        return str(obj.closing_date)

    closing_date_display.short_description = "Closing Date"
    closing_date_display.admin_order_field = "closing_date"

    def applications_count(self, obj):
        count = obj.applications.count()
        url = (
            reverse("admin:careers_jobapplication_changelist")
            + f"?job__id__exact={obj.id}"
        )
        return format_html(
            '<a href="{}" style="font-weight: 600; color: #2563eb;">{} applicant{}</a>',
            url,
            count,
            "s" if count != 1 else "",
        )

    applications_count.short_description = "Applications"

    @admin.action(description="Mark selected jobs as active")
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} job(s) marked as active.")

    @admin.action(description="Mark selected jobs as inactive")
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} job(s) marked as inactive.")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "applicant_name",
        "applicant_email",
        "job_title_link",
        "status_badge",
        "cv_download_link",
        "applied_at",
    )
    list_filter = ("status", "job__job_type", "job", "applied_at")
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "job__title",
        "cover_letter",
    )
    readonly_fields = ("id", "user", "job", "applied_at", "cv_download_link")
    actions = ["mark_as_reviewed", "mark_as_accepted", "mark_as_rejected"]

    fieldsets = (
        (
            "Application Information",
            {
                "fields": (
                    "id",
                    "job",
                    "user",
                    "status",
                    "applied_at",
                )
            },
        ),
        (
            "Resume / CV",
            {
                "fields": (
                    "cv_file",
                    "cv_download_link",
                )
            },
        ),
        (
            "Cover Letter",
            {
                "fields": ("cover_letter",),
            },
        ),
    )

    def applicant_name(self, obj):
        return obj.user.get_full_name() or "-"

    applicant_name.short_description = "Applicant Name"
    applicant_name.admin_order_field = "user__first_name"

    def applicant_email(self, obj):
        url = reverse("admin:accounts_user_change", args=[obj.user.id])
        return format_html(
            '<a href="{}" style="color: #2563eb; font-weight: 500;">{}</a>',
            url,
            obj.user.email,
        )

    applicant_email.short_description = "Email"
    applicant_email.admin_order_field = "user__email"

    def job_title_link(self, obj):
        url = reverse("admin:careers_job_change", args=[obj.job.id])
        return format_html(
            '<a href="{}" style="color: #1e40af; font-weight: 500;">{}</a>',
            url,
            obj.job.title,
        )

    job_title_link.short_description = "Job Position"
    job_title_link.admin_order_field = "job__title"

    def status_badge(self, obj):
        colors = {
            JobApplicationStatus.PENDING: ("#92400e", "#fef3c7"),
            JobApplicationStatus.REVIEWED: ("#1e40af", "#dbeafe"),
            JobApplicationStatus.ACCEPTED: ("#065f46", "#d1fae5"),
            JobApplicationStatus.REJECTED: ("#991b1b", "#fee2e2"),
        }
        text_color, bg_color = colors.get(obj.status, ("#374151", "#f3f4f6"))
        return format_html(
            '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: {}; background-color: {};">{}</span>',
            text_color,
            bg_color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    def cv_download_link(self, obj):
        if obj.cv_file:
            return format_html(
                '<a href="{}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: 500; text-decoration: none;">📄 View / Download CV</a>',
                obj.cv_file.url,
            )
        return format_html('<span style="color: #9ca3af;">No CV uploaded</span>')

    cv_download_link.short_description = "Resume / CV"

    @admin.action(description="Mark selected applications as Reviewed")
    def mark_as_reviewed(self, request, queryset):
        updated = queryset.update(status=JobApplicationStatus.REVIEWED)
        self.message_user(request, f"{updated} application(s) marked as Reviewed.")

    @admin.action(description="Mark selected applications as Accepted")
    def mark_as_accepted(self, request, queryset):
        updated = queryset.update(status=JobApplicationStatus.ACCEPTED)
        self.message_user(request, f"{updated} application(s) marked as Accepted.")

    @admin.action(description="Mark selected applications as Rejected")
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status=JobApplicationStatus.REJECTED)
        self.message_user(request, f"{updated} application(s) marked as Rejected.")

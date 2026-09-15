from django.contrib import admin
from .models import Enrollment, LessonProgress, Certificate, CourseCertificateConfig


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "course",
        "progress_percentage",
        "enrolled_at",
        "completed_at",
    )
    list_filter = ("enrolled_at", "completed_at")
    search_fields = ("student__email", "course__title")
    readonly_fields = ("enrolled_at", "last_accessed", "completed_at")


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "lesson", "completed", "completed_at")
    list_filter = ("completed", "completed_at")


@admin.register(CourseCertificateConfig)
class CourseCertificateConfigAdmin(admin.ModelAdmin):
    list_display = ("course", "template_id", "is_active", "organization_name", "authorizer_name", "updated_at")
    list_filter = ("is_active", "template_id")
    search_fields = ("course__title", "organization_name", "authorizer_name")


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_number", "student_name", "course_name", "status", "template_id", "issue_date", "issued_at")
    list_filter = ("status", "template_id", "issue_date")
    search_fields = ("certificate_number", "student_name", "course_name", "enrollment__student__email")
    readonly_fields = ("certificate_number", "issued_at", "updated_at")


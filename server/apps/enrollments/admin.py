from django.contrib import admin
from .models import Enrollment, LessonProgress, Certificate


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


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_number", "enrollment", "issued_at")
    readonly_fields = ("certificate_number", "issued_at")

"""
Django admin for courses app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Course, Section, Lesson, Review, CourseStatus


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "course_count", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")

    def course_count(self, obj):
        return obj.courses.count()

    course_count.short_description = "Courses"  # type: ignore


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    fields = ("title", "order")


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ("student", "rating", "review_text", "created_at")
    can_delete = False


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "who_can_join",
        "instructor_name",
        "category",
        "status",
        "price",
        "enrollment_count",
        "average_rating",
        "created_at",
    )
    list_filter = ("status", "difficulty_level", "is_free", "category", "created_at")
    search_fields = ("title", "description", "instructor__email")
    prepopulated_fields = {
        "slug": ["title"]
        }
    readonly_fields = (
        "enrollment_count",
        "average_rating",
        "total_reviews",
        "created_at",
        "updated_at",
        "published_at",
    )
    inlines = [SectionInline, ReviewInline]

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "title",
                    "slug",
                    "description",
                    "short_description",
                    "instructor",
                )
            },
        ),
        ("Classification", {"fields": ("category", "difficulty_level")}),
        ("Pricing", {"fields": ("price", "is_free")}),
        ("Media", {"fields": ("thumbnail", "preview_video")}),
        (
            "Course Details",
            {
                "fields": (
                    "duration_hours",
                    "requirements",
                    "learning_outcomes",
                    "target_audience",
                    "who_can_join",
                )
            },
        ),
        (
            "Status & Review",
            {"fields": ("status", "reviewed_by", "review_notes", "reviewed_at")},
        ),
        (
            "Statistics",
            {"fields": ("enrollment_count", "average_rating", "total_reviews")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at", "published_at")}),
    )

    def instructor_name(self, obj):
        return obj.instructor.get_full_name()

    instructor_name.short_description = "Instructor"  # type: ignore

    actions = ["approve_courses", "publish_courses", "reject_courses"]

    def approve_courses(self, request, queryset):
        from django.utils import timezone

        count = queryset.filter(status=CourseStatus.PENDING).update(
            status=CourseStatus.APPROVED,
            reviewed_by=request.user,
            reviewed_at=timezone.now(),
        )
        self.message_user(request, f"{count} course(s) approved.")

    approve_courses.short_description = "Approve selected courses"  # type: ignore

    def publish_courses(self, request, queryset):
        from django.utils import timezone

        for course in queryset.filter(
            status__in=[CourseStatus.PENDING, CourseStatus.APPROVED]
        ):
            course.status = CourseStatus.PUBLISHED
            course.reviewed_by = request.user
            course.reviewed_at = timezone.now()
            if not course.published_at:
                course.published_at = timezone.now()
            course.save()
        self.message_user(request, f"{queryset.count()} course(s) published.")

    publish_courses.short_description = "Publish selected courses"  # type: ignore

    def reject_courses(self, request, queryset):
        from django.utils import timezone

        count = queryset.filter(status=CourseStatus.PENDING).update(
            status=CourseStatus.REJECTED,
            reviewed_by=request.user,
            reviewed_at=timezone.now(),
        )
        self.message_user(request, f"{count} course(s) rejected.")

    reject_courses.short_description = "Reject selected courses"  # type: ignore


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "lesson_count", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "course__title")
    ordering = ("course", "order")

    def lesson_count(self, obj):
        return obj.lessons.count()

    lesson_count.short_description = "Lessons"  # type: ignore


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "section",
        "lesson_type",
        "is_preview",
        "order",
        "created_at",
    )
    list_filter = ("lesson_type", "is_preview", "created_at")
    search_fields = ("title", "section__title", "section__course__title")
    ordering = ("section", "order")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("course", "student_name", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("course__title", "student__email", "review_text")
    readonly_fields = ("created_at", "updated_at")

    def student_name(self, obj):
        return obj.student.get_full_name()

    student_name.short_description = "Student"  # type: ignore

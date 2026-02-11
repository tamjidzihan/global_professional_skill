"""
Django admin for courses app.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
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
    fields = ("title", "order", "lesson_count")
    readonly_fields = ("lesson_count",)
    show_change_link = True

    def lesson_count(self, obj):
        return obj.lessons.count()
    
    lesson_count.short_description = "Lessons"  # type: ignore


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ("student", "rating", "review_text", "created_at")
    can_delete = False


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "instructor_name",
        "category",
        "status",
        "price",
        "enrollment_count",
        "available_seats_status",
        "total_classes",
        "admission_status",
        "class_starts",
        "average_rating",
        "created_at",
    )
    list_filter = (
        "status", 
        "difficulty_level", 
        "is_free", 
        "category", 
        "created_at",
        "class_starts",
        "admission_deadline",
        "venue",
    )
    search_fields = (
        "title", 
        "description", 
        "instructor__email", 
        "venue", 
        "schedule"
    )
    prepopulated_fields = {"slug": ["title"]}
    readonly_fields = (
        "enrollment_count",
        "available_seats",
        "average_rating",
        "total_reviews",
        "total_classes_display",
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
            "Class Schedule & Venue",
            {
                "fields": (
                    "class_starts",
                    "admission_deadline",
                    "schedule",
                    "venue",
                ),
                "description": "Set class schedule, start date, deadline, and location",
            },
        ),
        (
            "Capacity Management",
            {
                "fields": (
                    "total_seats",
                    "available_seats",
                    "total_classes_display",
                    "enrollment_count",
                ),
                "description": "Manage course capacity and enrollment",
            },
        ),
        (
            "Status & Review",
            {"fields": ("status", "reviewed_by", "review_notes", "reviewed_at")},
        ),
        (
            "Statistics",
            {"fields": ("average_rating", "total_reviews")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at", "published_at")}),
    )

    def instructor_name(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.email

    instructor_name.short_description = "Instructor" # type: ignore
    instructor_name.admin_order_field = "instructor__first_name"  # type: ignore

    def total_classes(self, obj):
        count = obj.total_classes
        return format_html('{} <span style="color: #999;">classes</span>', count)

    total_classes.short_description = "Total Classes" # type: ignore
    total_classes.admin_order_field = "sections__count"  # type: ignore

    def total_classes_display(self, obj):
        count = obj.total_classes
        return format_html(
            '<strong>{}</strong> section{} total',
            count,
            's' if count != 1 else ''
        )
    
    total_classes_display.short_description = "Total Classes" # type: ignore

    def available_seats_status(self, obj):
        if obj.available_seats <= 0:
            return format_html(
                '<span style="color: white; background-color: #dc3545; padding: 3px 7px; border-radius: 3px;">FULL</span>'
            )
        elif obj.available_seats <= obj.total_seats * 0.2:  # 20% or less seats available
            return format_html(
                '<span style="color: #721c24; background-color: #f8d7da; padding: 3px 7px; border-radius: 3px;">⚠️ {} seats left</span>',
                obj.available_seats
            )
        else:
            return format_html(
                '<span style="color: #155724; background-color: #d4edda; padding: 3px 7px; border-radius: 3px;">{}/{} seats</span>',
                obj.available_seats,
                obj.total_seats
            )

    available_seats_status.short_description = "Available Seats" # type: ignore
    available_seats_status.admin_order_field = "available_seats"  # type: ignore

    def admission_status(self, obj):
        if not obj.admission_deadline:
            return format_html('<span style="color: #17a2b8;">No deadline</span>')
        
        today = timezone.now().date()
        days_left = (obj.admission_deadline - today).days
        
        if days_left < 0:
            return format_html(
                '<span style="color: #dc3545;">Closed</span>'
            )
        elif days_left <= 3:
            return format_html(
                '<span style="color: #fd7e14;">{} days left!</span>',
                days_left
            )
        else:
            return format_html(
                '<span style="color: #28a745;">{} days left</span>',
                days_left
            )

    admission_status.short_description = "Admission" # type: ignore
    admission_status.admin_order_field = "admission_deadline"  # type: ignore

    actions = [
        "approve_courses", 
        "publish_courses", 
        "reject_courses",
        "extend_admission_deadline",
        "increase_capacity",
        "reset_available_seats"
    ]

    def approve_courses(self, request, queryset):
        count = queryset.filter(status=CourseStatus.PENDING).update(
            status=CourseStatus.APPROVED,
            reviewed_by=request.user,
            reviewed_at=timezone.now(),
        )
        self.message_user(request, f"{count} course(s) approved.")

    approve_courses.short_description = "✅ Approve selected courses" # type: ignore

    def publish_courses(self, request, queryset):
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

    publish_courses.short_description = "📢 Publish selected courses" # type: ignore

    def reject_courses(self, request, queryset):
        count = queryset.filter(status=CourseStatus.PENDING).update(
            status=CourseStatus.REJECTED,
            reviewed_by=request.user,
            reviewed_at=timezone.now(),
        )
        self.message_user(request, f"{count} course(s) rejected.")

    reject_courses.short_description = "❌ Reject selected courses" # type: ignore

    def extend_admission_deadline(self, request, queryset):
        """Extend admission deadline by 7 days for selected courses"""
        from django.utils import timezone
        from datetime import timedelta
        
        count = 0
        for course in queryset:
            if course.admission_deadline:
                course.admission_deadline += timedelta(days=7)
                course.save()
                count += 1
            elif course.class_starts:
                # If no deadline, set it to 7 days before class starts
                course.admission_deadline = course.class_starts - timedelta(days=7)
                course.save()
                count += 1
        
        self.message_user(
            request, 
            f"Extended admission deadline for {count} course(s)."
        )

    extend_admission_deadline.short_description = "📅 Extend admission deadline (+7 days)" # type: ignore

    def increase_capacity(self, request, queryset):
        """Increase total seats by 5 for selected courses"""
        count = 0
        for course in queryset:
            course.total_seats += 5
            course.available_seats += 5
            course.save()
            count += 1
        
        self.message_user(
            request, 
            f"Increased capacity by 5 seats for {count} course(s)."
        )

    increase_capacity.short_description = "⬆️ Increase capacity (+5 seats)" # type: ignore

    def reset_available_seats(self, request, queryset):
        """Reset available seats to total seats"""
        count = 0
        for course in queryset:
            course.available_seats = course.total_seats
            course.save()
            count += 1
        
        self.message_user(
            request, 
            f"Reset available seats for {count} course(s)."
        )

    reset_available_seats.short_description = "🔄 Reset available seats" # type: ignore


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "course_link", "order", "lesson_count", "created_at")
    list_filter = ("created_at", "course__category")
    search_fields = ("title", "course__title", "course__instructor__email")
    ordering = ("course", "order")
    list_select_related = ("course",)

    def course_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:courses_course_change', args=[obj.course.id])
        return format_html('<a href="{}">{}</a>', url, obj.course.title)
    
    course_link.short_description = "Course" # type: ignore
    course_link.admin_order_field = "course__title"  # type: ignore

    def lesson_count(self, obj):
        count = obj.lessons.count()
        from django.urls import reverse
        url = reverse('admin:courses_lesson_changelist')
        return format_html(
            '<a href="{}?section__id__exact={}">{} lesson{}</a>',
            url,
            obj.id,
            count,
            's' if count != 1 else ''
        )

    lesson_count.short_description = "Lessons" # type: ignore


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "section_link",
        "course_link",
        "lesson_type",
        "is_preview",
        "order",
        "created_at",
    )
    list_filter = ("lesson_type", "is_preview", "created_at", "section__course")
    search_fields = ("title", "section__title", "section__course__title")
    ordering = ("section", "order")
    list_select_related = ("section", "section__course")

    def section_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:courses_section_change', args=[obj.section.id])
        return format_html('<a href="{}">{}</a>', url, obj.section.title)
    
    section_link.short_description = "Section" # type: ignore
    section_link.admin_order_field = "section__title"  # type: ignore

    def course_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:courses_course_change', args=[obj.section.course.id])
        return format_html('<a href="{}">{}</a>', url, obj.section.course.title)
    
    course_link.short_description = "Course" # type: ignore
    course_link.admin_order_field = "section__course__title"  # type: ignore


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "course_title", 
        "student_name", 
        "rating_stars", 
        "review_preview", 
        "created_at"
    )
    list_filter = ("rating", "created_at", "course")
    search_fields = ("course__title", "student__email", "review_text")
    readonly_fields = ("created_at", "updated_at", "rating_stars_display")
    list_select_related = ("course", "student")

    def course_title(self, obj):
        from django.urls import reverse
        url = reverse('admin:courses_course_change', args=[obj.course.id])
        return format_html('<a href="{}">{}</a>', url, obj.course.title)
    
    course_title.short_description = "Course" # type: ignore
    course_title.admin_order_field = "course__title"  # type: ignore

    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    
    student_name.short_description = "Student" # type: ignore
    student_name.admin_order_field = "student__first_name"  # type: ignore

    def rating_stars(self, obj):
        full_stars = "★" * obj.rating
        empty_stars = "☆" * (5 - obj.rating)
        color = self._get_rating_color(obj.rating)
        return format_html(
            '<span style="color: {};">{}{}</span>',
            color,
            full_stars,
            empty_stars
        )
    
    rating_stars.short_description = "Rating" # type: ignore
    rating_stars.admin_order_field = "rating"  # type: ignore

    def rating_stars_display(self, obj):
        return self.rating_stars(obj)
    
    rating_stars_display.short_description = "Rating" # type: ignore

    def review_preview(self, obj):
        if obj.review_text:
            return obj.review_text[:75] + "..." if len(obj.review_text) > 75 else obj.review_text
        return format_html('<span style="color: #999;">No comment</span>')
    
    review_preview.short_description = "Review" # type: ignore

    def _get_rating_color(self, rating):
        if rating >= 4:
            return "#28a745"  # Green
        elif rating >= 3:
            return "#17a2b8"  # Blue
        elif rating >= 2:
            return "#fd7e14"  # Orange
        else:
            return "#dc3545"  # Red
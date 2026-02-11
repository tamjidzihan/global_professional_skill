"""
Course models with approval workflow.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.accounts.models import User
import uuid


class CourseStatus(models.TextChoices):
    """Course status choices."""

    DRAFT = "DRAFT", "Draft"
    PENDING = "PENDING", "Pending Review"
    APPROVED = "APPROVED", "Approved"
    PUBLISHED = "PUBLISHED", "Published"
    REJECTED = "REJECTED", "Rejected"


class DifficultyLevel(models.TextChoices):
    """Course difficulty level choices."""

    BEGINNER = "BEGINNER", "Beginner"
    INTERMEDIATE = "INTERMEDIATE", "Intermediate"
    ADVANCED = "ADVANCED", "Advanced"


class Category(models.Model):
    """Course category model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or emoji")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    """Course model with approval workflow."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic Information
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500)

    # Instructor
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="courses",
        limit_choices_to={"role": "INSTRUCTOR"},
    )

    # Category & Level
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="courses"
    )
    difficulty_level = models.CharField(
        max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.BEGINNER
    )

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Course price in USD (0 for free)",
    )
    is_free = models.BooleanField(default=False)

    # Media
    thumbnail = models.ImageField(
        upload_to="courses/thumbnails/", null=True, blank=True
    )
    preview_video = models.URLField(
        max_length=500, blank=True, help_text="Preview video URL"
    )

    # Course Details
    duration_hours = models.PositiveIntegerField(
        default=0, help_text="Estimated course duration in hours"
    )
    requirements = models.TextField(
        blank=True, help_text="Prerequisites for the course"
    )
    learning_outcomes = models.TextField(help_text="What students will learn")
    target_audience = models.TextField(blank=True, help_text="Who this course is for")
    who_can_join = models.TextField(blank=True, help_text="Who can join this course")

    # Class Schedule Information
    class_starts = models.DateField(
        null=True, blank=True, help_text="Date when classes start"
    )
    admission_deadline = models.DateField(
        null=True, blank=True, help_text="Last date for admission"
    )
    schedule = models.TextField(
        blank=True, 
        help_text="e.g., Saturday, Monday, Wednesday - 6:30PM to 9:00PM"
    )
    venue = models.CharField(
        max_length=255, 
        blank=True, 
        help_text="Class venue/location"
    )
    
    # Capacity Information
    total_seats = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(1)],
        help_text="Maximum number of students allowed"
    )
    available_seats = models.PositiveIntegerField(
        default=30,
        help_text="Number of seats currently available"
    )

    # Status & Approval
    status = models.CharField(
        max_length=20,
        choices=CourseStatus.choices,
        default=CourseStatus.DRAFT,
        db_index=True,
    )

    # Admin Review
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_courses",
        limit_choices_to={"role": "ADMIN"},
    )
    review_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Statistics
    enrollment_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,  # type: ignore
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_reviews = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "courses"
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "is_free"]),
            models.Index(fields=["instructor", "status"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["-enrollment_count"]),
            models.Index(fields=["-average_rating"]),
            models.Index(fields=["class_starts"]),
            models.Index(fields=["admission_deadline"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Auto-set is_free based on price and ensure available_seats doesn't exceed total_seats."""
        self.is_free = self.price == 0
        
        # Ensure available_seats doesn't exceed total_seats
        if self.available_seats > self.total_seats:
            self.available_seats = self.total_seats
            
        # Ensure enrollment_count doesn't exceed total_seats
        if self.enrollment_count > self.total_seats:
            self.enrollment_count = self.total_seats
            
        super().save(*args, **kwargs)

    @property
    def is_published(self):
        """Check if course is published."""
        return self.status == CourseStatus.PUBLISHED

    @property
    def lesson_count(self):
        """Get total number of lessons."""
        return self.sections.aggregate(total=models.Sum("lessons__id"))["total"] or 0  # type: ignore

    @property
    def total_classes(self):
        """Count total number of sections (classes)."""
        return self.sections.count() # type: ignore

    @property
    def is_admission_open(self):
        """Check if admission is still open."""
        if not self.admission_deadline:
            return True
        return self.admission_deadline >= timezone.now().date()

    @property
    def is_full(self):
        """Check if course is full."""
        return self.available_seats <= 0

    def decrease_available_seats(self, count=1):
        """Decrease available seats when a student enrolls."""
        if self.available_seats >= count:
            self.available_seats -= count
            self.save(update_fields=["available_seats"])
            return True
        return False

    def increase_available_seats(self, count=1):
        """Increase available seats when a student unenrolls."""
        self.available_seats = min(self.available_seats + count, self.total_seats)
        self.save(update_fields=["available_seats"])


class Section(models.Model):
    """Course section (module) model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="sections"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "course_sections"
        verbose_name = "Section"
        verbose_name_plural = "Sections"
        ordering = ["course", "order"]
        unique_together = ["course", "order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class LessonType(models.TextChoices):
    """Lesson type choices."""

    VIDEO = "VIDEO", "Video"
    TEXT = "TEXT", "Text/Article"
    QUIZ = "QUIZ", "Quiz"
    ASSIGNMENT = "ASSIGNMENT", "Assignment"
    RESOURCE = "RESOURCE", "Resource/Download"


class Lesson(models.Model):
    """Course lesson model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(
        max_length=20, choices=LessonType.choices, default=LessonType.VIDEO
    )

    # Content
    content = models.TextField(blank=True, help_text="Text content or description")
    video_url = models.URLField(
        max_length=500, blank=True, help_text="Video URL (YouTube, Vimeo, etc.)"
    )
    video_duration = models.PositiveIntegerField(
        default=0, help_text="Video duration in seconds"
    )

    # Resources
    resources = models.FileField(
        upload_to="courses/resources/",
        null=True,
        blank=True,
        help_text="Downloadable resources",
    )

    # Settings
    is_preview = models.BooleanField(
        default=False, help_text="Allow preview without enrollment"
    )
    order = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lessons"
        verbose_name = "Lesson"
        verbose_name_plural = "Lessons"
        ordering = ["section", "order"]
        unique_together = ["section", "order"]

    def __str__(self):
        return f"{self.section.course.title} - {self.section.title} - {self.title}"

    @property
    def course(self):
        """Get the course this lesson belongs to."""
        return self.section.course


class Review(models.Model):
    """Course review and rating model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="course_reviews"
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5",
    )
    review_text = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "course_reviews"
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ["-created_at"]
        unique_together = ["course", "student"]  # One review per student per course
        indexes = [
            models.Index(fields=["course", "-created_at"]),
            models.Index(fields=["student", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.student.email} - {self.rating} stars"

    def save(self, *args, **kwargs):
        """Update course average rating when review is saved."""
        super().save(*args, **kwargs)
        self.update_course_rating()

    def delete(self, *args, **kwargs):  # type: ignore
        """Update course average rating when review is deleted."""
        super().delete(*args, **kwargs)
        self.update_course_rating()

    def update_course_rating(self):
        """Recalculate course average rating."""
        from django.db.models import Avg, Count

        stats = Review.objects.filter(course=self.course).aggregate(
            avg_rating=Avg("rating"), total_reviews=Count("id")
        )
        self.course.average_rating = stats["avg_rating"] or 0
        self.course.total_reviews = stats["total_reviews"] or 0
        self.course.save(update_fields=["average_rating", "total_reviews"])
"""
Enrollment and progress tracking models.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from courses.models import Course, Lesson
import uuid


class Enrollment(models.Model):
    """Student enrollment in courses."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )

    # Progress tracking
    progress_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,  # type: ignore
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    completed_lessons = models.ManyToManyField(
        Lesson, through="LessonProgress", related_name="completed_by"
    )

    # Timestamps
    enrolled_at = models.DateTimeField(auto_now_add=True, db_index=True)
    last_accessed = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "enrollments"
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        ordering = ["-enrolled_at"]
        unique_together = ["student", "course"]
        indexes = [
            models.Index(fields=["student", "course"]),
            models.Index(fields=["student", "-enrolled_at"]),
            models.Index(fields=["course", "-enrolled_at"]),
        ]

    def __str__(self):
        return f"{self.student.email} enrolled in {self.course.title}"

    def update_progress(self):
        """Calculate and update progress percentage."""
        total_lessons = (
            self.course.sections.aggregate(total=models.Count("lessons"))["total"] or 0  # type: ignore
        )

        if total_lessons == 0:
            self.progress_percentage = 0
        else:
            completed = self.lesson_progress.filter(completed=True).count()  # type: ignore
            self.progress_percentage = (completed / total_lessons) * 100

        # Mark as completed if 100%
        if self.progress_percentage >= 100 and not self.completed_at:
            from django.utils import timezone

            self.completed_at = timezone.now()

        self.save(update_fields=["progress_percentage", "completed_at"])


class LessonProgress(models.Model):
    """Track student progress on individual lessons."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="student_progress"
    )
    completed = models.BooleanField(default=False)

    # For video lessons
    watched_duration = models.PositiveIntegerField(
        default=0, help_text="Seconds watched"
    )

    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lesson_progress"
        verbose_name = "Lesson Progress"
        verbose_name_plural = "Lesson Progress"
        ordering = ["-last_accessed"]
        unique_together = ["enrollment", "lesson"]
        indexes = [
            models.Index(fields=["enrollment", "completed"]),
        ]

    def __str__(self):
        return f"{self.enrollment.student.email} - {self.lesson.title}"

    def mark_complete(self):
        """Mark lesson as completed."""
        if not self.completed:
            from django.utils import timezone

            self.completed = True
            self.completed_at = timezone.now()
            self.save(update_fields=["completed", "completed_at"])

            # Update enrollment progress
            self.enrollment.update_progress()


class Certificate(models.Model):
    """Course completion certificates."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(
        Enrollment, on_delete=models.CASCADE, related_name="certificate"
    )
    certificate_number = models.CharField(max_length=100, unique=True, db_index=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "certificates"
        verbose_name = "Certificate"
        verbose_name_plural = "Certificates"
        ordering = ["-issued_at"]

    def __str__(self):
        return (
            f"Certificate {self.certificate_number} for {self.enrollment.student.email}"
        )

    def save(self, *args, **kwargs):
        """Auto-generate certificate number."""
        if not self.certificate_number:
            import random
            import string

            self.certificate_number = "".join(
                random.choices(string.ascii_uppercase + string.digits, k=12)
            )
        super().save(*args, **kwargs)

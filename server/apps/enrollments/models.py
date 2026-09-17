"""
Enrollment and progress tracking models.
"""

from django.db import models, transaction
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.accounts.models import User
from apps.courses.models import Course, Lesson
import uuid
import secrets
import string


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
        """Calculate and update progress percentage based on completed lessons."""
        course = self.course
        total_lessons = (
            course.sections.aggregate(total=models.Count("lessons"))["total"] or 0  # type: ignore
        )

        if total_lessons == 0:
            self.progress_percentage = 0
        else:
            if course.delivery_mode in ['ONLINE', 'BOTH']:
                # For online/hybrid, progress is driven by instructor-completed lessons
                completed = Lesson.objects.filter(
                    section__course=course,
                    is_completed=True
                ).count()
            else:
                # For others, driven by student completion (per lesson)
                completed = self.lesson_progress.filter(completed=True).count()  # type: ignore
                
            self.progress_percentage = (completed / total_lessons) * 100

        # Mark as completed if 100%
        if self.progress_percentage >= 100 and not self.completed_at:
            self.completed_at = timezone.now()

        self.save(update_fields=["progress_percentage", "completed_at"])

        # Check and automatically issue certificate if eligible
        if self.progress_percentage >= 100:
            try:
                check_and_issue_certificate(self)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error checking/issuing certificate for enrollment {self.id}: {str(e)}")


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
            self.completed = True
            self.completed_at = timezone.now()
            self.save(update_fields=["completed", "completed_at"])

            # Update enrollment progress
            self.enrollment.update_progress()


class CertificateTemplate(models.TextChoices):
    """Available professional certificate templates."""

    TEMPLATE_1 = "template_1", "Academic Prestige"
    TEMPLATE_2 = "template_2", "Professional Classic"
    TEMPLATE_3 = "template_3", "Modern Minimal"
    TEMPLATE_4 = "template_4", "Premium Corporate"


class CourseCertificateConfig(models.Model):
    """
    Course-level certificate configuration configured and issued by Admin.
    When active, any student who satisfies the eligibility requirements
    automatically receives their certificate for this course.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.OneToOneField(
        Course, on_delete=models.CASCADE, related_name="certificate_config"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="When true, eligible students receive certificates automatically."
    )
    template_id = models.CharField(
        max_length=50,
        choices=CertificateTemplate.choices,
        default=CertificateTemplate.TEMPLATE_1,
        help_text="Selected certificate design template."
    )
    organization_name = models.CharField(
        max_length=255,
        default="Global Professional Institute",
        help_text="Organization / Institution name printed on certificate."
    )
    logo_image = models.ImageField(
        upload_to="certificates/logos/",
        null=True,
        blank=True,
        help_text="Custom logo for certificate. Defaults to site logo if empty."
    )
    logo_size = models.PositiveIntegerField(
        default=100,
        help_text="Custom logo size percentage (default 100)."
    )
    authorizer_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Name of the authorizer / signatory."
    )
    authorizer_position = models.CharField(
        max_length=255,
        blank=True,
        default="Director",
        help_text="Title / position of the authorizer."
    )
    signature_image = models.ImageField(
        upload_to="certificates/signatures/",
        null=True,
        blank=True,
        help_text="Authorized signature image."
    )
    signature_size = models.PositiveIntegerField(
        default=100,
        help_text="Custom signature size percentage (default 100)."
    )
    # Additional Authorizer & Signature (Optional)
    enable_additional_authorizer = models.BooleanField(
        default=False,
        help_text="When true, displays an additional authorizer & signature on the certificate."
    )
    additional_authorizer_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Name of the additional authorizer / signatory."
    )
    additional_authorizer_position = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Title / position of the additional authorizer."
    )
    additional_signature_image = models.ImageField(
        upload_to="certificates/signatures/",
        null=True,
        blank=True,
        help_text="Additional authorized signature image."
    )
    additional_signature_size = models.PositiveIntegerField(
        default=100,
        help_text="Additional signature scale percentage (default 100)."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_course_certificate_configs"
    )

    class Meta:
        db_table = "course_certificate_configs"
        verbose_name = "Course Certificate Configuration"
        verbose_name_plural = "Course Certificate Configurations"

    def __str__(self):
        return f"Certificate Config for {self.course.title} ({self.get_template_id_display()})"


class CertificateStatus(models.TextChoices):
    """Certificate status choices."""

    ISSUED = "ISSUED", "Issued"
    REVOKED = "REVOKED", "Revoked"


def generate_certificate_number(year=None):
    """
    Generate a highly randomized unique certificate number.
    Format: GPI-XXX-DDDD-DDDDDD (e.g. GPI-SJO-4484-487641, GPI-SPO-2264-484641)
    Only the 'GPI-' part is constant; the remaining components are cryptographically randomized.
    """
    letters = string.ascii_uppercase
    digits = string.digits

    while True:
        part1 = "".join(secrets.choice(letters) for _ in range(3))
        part2 = "".join(secrets.choice(digits) for _ in range(4))
        part3 = "".join(secrets.choice(digits) for _ in range(6))
        candidate = f"GPI-{part1}-{part2}-{part3}"

        if not Certificate.objects.filter(certificate_number=candidate).exists():
            return candidate


class Certificate(models.Model):
    """
    Course completion certificate record.
    Preserves an immutable snapshot of student name, course, organization, template,
    authorizer, and signatures at the time of issuance.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(
        Enrollment, on_delete=models.CASCADE, related_name="certificate"
    )
    certificate_number = models.CharField(
        max_length=100, unique=True, db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=CertificateStatus.choices,
        default=CertificateStatus.ISSUED,
        db_index=True
    )

    # Snapshot fields at time of issuance
    student_name = models.CharField(
        max_length=255,
        default="",
        blank=True,
        help_text="Student display name on certificate (snapshot)."
    )
    course_name = models.CharField(
        max_length=255,
        default="",
        blank=True,
        help_text="Course title on certificate (snapshot)."
    )
    organization_name = models.CharField(
        max_length=255,
        default="Global Professional Institute",
        help_text="Organization name (snapshot)."
    )
    template_id = models.CharField(
        max_length=50,
        choices=CertificateTemplate.choices,
        default=CertificateTemplate.TEMPLATE_1
    )
    logo_image = models.ImageField(
        upload_to="certificates/issued_logos/",
        null=True,
        blank=True
    )
    logo_size = models.PositiveIntegerField(
        default=100,
        help_text="Logo scale percentage (snapshot)."
    )
    authorizer_name = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )
    authorizer_position = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )
    signature_image = models.ImageField(
        upload_to="certificates/issued_signatures/",
        null=True,
        blank=True
    )
    signature_size = models.PositiveIntegerField(
        default=100,
        help_text="Signature scale percentage (snapshot)."
    )
    # Additional Authorizer Snapshot
    enable_additional_authorizer = models.BooleanField(
        default=False,
        help_text="Whether additional authorizer was enabled at time of issuance (snapshot)."
    )
    additional_authorizer_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Additional authorizer display name on certificate (snapshot)."
    )
    additional_authorizer_position = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Additional authorizer position on certificate (snapshot)."
    )
    additional_signature_image = models.ImageField(
        upload_to="certificates/issued_signatures/",
        null=True,
        blank=True,
        help_text="Additional authorized signature image (snapshot)."
    )
    additional_signature_size = models.PositiveIntegerField(
        default=100,
        help_text="Additional signature scale percentage (snapshot)."
    )
    issue_date = models.DateField(
        default=timezone.now
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    issued_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="issued_certificates"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_certificates"
    )

    # Revocation support
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.TextField(blank=True)

    class Meta:
        db_table = "certificates"
        verbose_name = "Certificate"
        verbose_name_plural = "Certificates"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.certificate_number} — {self.student_name} ({self.course_name})"

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            year = self.issue_date.year if self.issue_date else timezone.now().year
            self.certificate_number = generate_certificate_number(year)
        if not self.student_name and self.enrollment:
            self.student_name = self.enrollment.student.get_full_name() or self.enrollment.student.email
        if not self.course_name and self.enrollment:
            self.course_name = self.enrollment.course.title
        super().save(*args, **kwargs)


def calculate_student_certificate_eligibility(enrollment):
    """
    Calculate eligibility details for a student's enrollment:
    Returns dict:
      - is_eligible: bool
      - eligibility_status: 'NOT_COMPLETED' | 'QUIZ_NOT_PASSED' | 'ELIGIBLE' | 'ISSUED'
      - course_completed: bool
      - progress_percentage: float
      - total_quizzes: int
      - completed_quizzes: int
      - average_quiz_score: float
      - quiz_pass_threshold: float
      - quiz_passed: bool
      - reason: str
    """
    from apps.core.models import SiteSettings
    from apps.courses.models import Quiz, QuizSubmission

    course = enrollment.course
    student = enrollment.student
    has_certificate = hasattr(enrollment, "certificate") and enrollment.certificate is not None
    is_course_completed = bool(enrollment.progress_percentage >= 100 or enrollment.completed_at)
    
    pass_threshold = float(SiteSettings.get_settings().quiz_pass_percentage or 50.0)
    quizzes = Quiz.objects.filter(course=course)
    total_quizzes = quizzes.count()
    
    if total_quizzes == 0:
        completed_quizzes = 0
        avg_score = 100.0
        quiz_passed = True
    else:
        # Get submissions
        submissions = QuizSubmission.objects.filter(
            student=student,
            quiz__in=quizzes,
            completed_at__isnull=False,
            is_disqualified=False
        )
        quiz_scores = {}
        for sub in submissions:
            total_q = sub.total_questions or (sub.quiz.questions.count() if sub.quiz else 0)
            if total_q > 0:
                pct = (sub.score / total_q) * 100.0
                if sub.quiz_id not in quiz_scores or pct > quiz_scores[sub.quiz_id]:
                    quiz_scores[sub.quiz_id] = pct
                    
        completed_quizzes = len(quiz_scores)
        if completed_quizzes > 0:
            avg_score = round(sum(quiz_scores.values()) / total_quizzes, 1)
        else:
            avg_score = 0.0
            
        quiz_passed = (completed_quizzes == total_quizzes) and (avg_score >= pass_threshold)

    # Determine status
    if has_certificate:
        status = "ISSUED"
        reason = "Certificate has been issued"
        is_eligible = True
    elif not is_course_completed:
        status = "NOT_COMPLETED"
        reason = "Course is not 100% complete"
        is_eligible = False
    elif not quiz_passed:
        status = "QUIZ_NOT_PASSED"
        if completed_quizzes < total_quizzes:
            reason = f"Completed {completed_quizzes} of {total_quizzes} quizzes"
        else:
            reason = f"Average quiz score ({avg_score}%) is below required threshold ({pass_threshold}%)"
        is_eligible = False
    else:
        status = "ELIGIBLE"
        reason = "All certificate requirements satisfied"
        is_eligible = True

    return {
        "is_eligible": is_eligible,
        "eligibility_status": status,
        "course_completed": is_course_completed,
        "progress_percentage": float(enrollment.progress_percentage),
        "total_quizzes": total_quizzes,
        "completed_quizzes": completed_quizzes,
        "average_quiz_score": avg_score,
        "quiz_pass_threshold": pass_threshold,
        "quiz_passed": quiz_passed,
        "reason": reason,
    }


def check_and_issue_certificate(enrollment, issued_by=None, custom_student_name=None):
    """
    Check if the student in this enrollment satisfies all eligibility criteria and
    automatically issue the Certificate if the course has an active CourseCertificateConfig.
    Returns (certificate, created_bool, reason_str).
    """
    if hasattr(enrollment, "certificate") and enrollment.certificate:
        return enrollment.certificate, False, "Certificate already exists"

    eligibility = calculate_student_certificate_eligibility(enrollment)
    if not eligibility["is_eligible"]:
        return None, False, eligibility["reason"]

    course = enrollment.course
    student = enrollment.student
    config = getattr(course, "certificate_config", None)
    if not config or not config.is_active:
        return None, False, "Course certificate configuration is not active"

    student_display_name = (
        custom_student_name.strip()
        if custom_student_name
        else (student.get_full_name() or student.email)
    )

    cert = Certificate.objects.create(
        enrollment=enrollment,
        status=CertificateStatus.ISSUED,
        student_name=student_display_name,
        course_name=course.title,
        organization_name=config.organization_name or "Global Professional Institute",
        template_id=config.template_id,
        logo_image=config.logo_image,
        logo_size=config.logo_size or 100,
        authorizer_name=config.authorizer_name,
        authorizer_position=config.authorizer_position,
        signature_image=config.signature_image,
        signature_size=config.signature_size or 100,
        enable_additional_authorizer=getattr(config, "enable_additional_authorizer", False),
        additional_authorizer_name=getattr(config, "additional_authorizer_name", "") or "",
        additional_authorizer_position=getattr(config, "additional_authorizer_position", "") or "",
        additional_signature_image=getattr(config, "additional_signature_image", None),
        additional_signature_size=getattr(config, "additional_signature_size", 100) or 100,
        issue_date=timezone.now().date(),
        issued_by=issued_by,
    )

    # Dispatch notification to student
    try:
        from apps.core.notification_service import dispatch_notification
        dispatch_notification(
            "EMAIL_COURSE_COMPLETION",
            user=student,
            context={
                "course_name": course.title,
                "student_name": student_display_name,
                "certificate_number": cert.certificate_number,
            },
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to dispatch certificate completion notification: {str(e)}")

    return cert, True, "Certificate issued successfully"


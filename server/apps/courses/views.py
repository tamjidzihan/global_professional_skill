"""
Views for courses app.
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import (
    Category,
    Course,
    Section,
    Lesson,
    Review,
    CourseStatus,
    Quiz,
    QuizQuestion,
    QuizSubmission,
    CourseMaterial,
    CourseAnnouncement,
)
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateUpdateSerializer,
    SectionSerializer,
    SectionCreateSerializer,
    LessonSerializer,
    ReviewSerializer,
    CourseReviewSerializer,
    QuizSerializer,
    QuizQuestionSerializer,
    QuizStudentQuestionSerializer,
    QuizSubmissionSerializer,
    CourseMaterialSerializer,
    CourseAnnouncementSerializer,
)
from apps.accounts.permissions import IsInstructor, IsAdmin, IsInstructorOrAdmin
from .permissions import IsCourseInstructorOrAdmin, IsEnrolledOrInstructor
import logging

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for course categories."""

    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        """Admin-only for create, update, delete."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for courses with approval workflow."""

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "category",
        "difficulty_level",
        "delivery_mode",
        "is_free",
        "status",
    ]
    search_fields = [
        "title",
        "description",
        "instructor__first_name",
        "instructor__last_name",
        "venue",
        "schedule",
    ]
    ordering_fields = [
        "created_at",
        "published_at",
        "enrollment_count",
        "average_rating",
        "price",
        "class_starts",
        "admission_deadline",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):  # type: ignore
        """Return appropriate serializer."""
        if self.action == "list":
            return CourseListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return CourseCreateUpdateSerializer
        elif self.action == "review":
            return CourseReviewSerializer
        return CourseDetailSerializer

    def get_queryset(self):  # type: ignore
        """
        Filter queryset based on user role:
        - Public users: Only published courses
        - Students: Only published courses
        - Instructors: Their own courses + published courses
        - Admins: All courses
        """
        user = self.request.user

        if not user.is_authenticated or user.is_student:  # type: ignore
            return (
                Course.objects.filter(status=CourseStatus.PUBLISHED)
                .select_related("instructor", "category")
                .prefetch_related("sections__lessons")
            )

        if user.is_instructor:  # type: ignore
            # Allow instructors to see their own courses AND all published courses
            return (
                Course.objects.filter(
                    Q(instructor=user) | Q(status=CourseStatus.PUBLISHED)
                )
                .select_related("instructor", "category")
                .prefetch_related("sections__lessons")
                .distinct()
            )

        if user.is_admin_user:  # type: ignore
            return Course.objects.select_related(
                "instructor", "category", "reviewed_by"
            ).prefetch_related("sections__lessons")

        return (
            Course.objects.filter(status=CourseStatus.PUBLISHED)
            .select_related("instructor", "category")
            .prefetch_related("sections__lessons")
        )

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == "create":
            return [IsInstructor()]
        elif self.action in ["update", "partial_update", "destroy"]:
            return [IsCourseInstructorOrAdmin()]
        elif self.action == "review":
            return [IsAdmin()]
        elif self.action in ["retrieve", "list"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        """List courses."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        """Retrieve course details."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response({"success": True, "data": serializer.data})

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create new course."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Course created successfully.",
                "data": CourseDetailSerializer(
                    course, context={"request": request}
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update course."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Course updated successfully.",
                "data": CourseDetailSerializer(
                    course, context={"request": request}
                ).data,
            }
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def review(self, request, pk=None):
        """Admin review course (approve/reject/publish)."""
        course = self.get_object()

        if course.status not in [CourseStatus.PENDING, CourseStatus.APPROVED]:
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Only PENDING or APPROVED courses can be reviewed."
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "message": f'Course {serializer.validated_data["status"].lower()} successfully.',
                "data": CourseDetailSerializer(
                    course, context={"request": request}
                ).data,
            }
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def submit_for_review(self, request, pk=None):
        """Submit course for admin review."""
        course = self.get_object()

        # Only instructor can submit
        if course.instructor != request.user:
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Only the course instructor can submit for review."
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if course.status != CourseStatus.DRAFT:
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Only DRAFT courses can be submitted for review."
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate course has content
        if not course.sections.exists():
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Course must have at least one section before submission."
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        course.status = CourseStatus.PENDING
        course.save(update_fields=["status"])

        return Response(
            {"success": True, "message": "Course submitted for review successfully."}
        )


class MyCoursesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for instructors to manage their own courses.
    Provides list, retrieve, update, and delete functionalities for courses
    owned by the currently authenticated instructor.
    """

    permission_classes = [IsInstructor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "category",
        "difficulty_level",
        "delivery_mode",
        "is_free",
        "status",
    ]
    search_fields = [
        "title",
        "description",
    ]
    ordering_fields = [
        "created_at",
        "published_at",
        "enrollment_count",
        "average_rating",
        "price",
        "status",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):  # type: ignore
        """
        This view should only return courses for the currently authenticated
        instructor.
        """
        return (
            Course.objects.filter(instructor=self.request.user)
            .select_related("instructor", "category", "reviewed_by")
            .prefetch_related("sections__lessons")
        )

    def get_serializer_class(self):  # type: ignore
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return CourseListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer

    def list(self, request, *args, **kwargs):
        """List instructor's courses."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        """Retrieve course details."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response({"success": True, "data": serializer.data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update course."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Course updated successfully.",
                "data": CourseDetailSerializer(
                    course, context={"request": request}
                ).data,
            }
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Delete course."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Course deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class SectionViewSet(viewsets.ModelViewSet):
    """ViewSet for course sections."""

    serializer_class = SectionSerializer
    permission_classes = [IsCourseInstructorOrAdmin]

    def get_queryset(self):  # type: ignore
        """Filter sections by course."""
        course_id = self.kwargs.get("course_pk")
        return Section.objects.filter(course_id=course_id).prefetch_related("lessons")

    def get_serializer_class(self):  # type: ignore
        """Use different serializer for creation."""
        if self.action in ["create", "update", "partial_update"]:
            return SectionCreateSerializer
        return SectionSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create section."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Section created successfully.",
                "data": SectionSerializer(section).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet for lessons."""

    serializer_class = LessonSerializer

    def get_permissions(self):
        """Check enrollment for retrieve, or instructor/admin for CUD."""
        if self.action == "retrieve":
            return [IsEnrolledOrInstructor()]
        return [IsCourseInstructorOrAdmin()]

    def get_queryset(self):  # type: ignore
        """Filter lessons by section."""
        section_id = self.kwargs.get("section_pk")
        return Lesson.objects.filter(section_id=section_id).select_related(
            "section__course"
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create lesson."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Lesson created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="toggle-complete")
    @transaction.atomic
    def toggle_complete(self, request, *args, **kwargs):
        """Toggle lesson completion status and update student progress."""
        lesson = self.get_object()
        course = lesson.section.course

        # Explicit check: Only course instructor or admin can update progress
        if course.instructor != request.user and not request.user.is_admin_user:
            return Response(
                {
                    "success": False,
                    "message": "Only the course instructor can update class progress.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        lesson.is_completed = not lesson.is_completed
        lesson.save()  # Trigger potential signals or model logic

        # If it's an online or hybrid course, update student progress
        if course.delivery_mode in ["ONLINE", "BOTH"]:
            enrollments = course.enrollments.all()
            for enrollment in enrollments:
                enrollment.update_progress()
                enrollment.save()  # Ensure progress_percentage is saved

        return Response(
            {
                "success": True,
                "message": f"Class marked as {'completed' if lesson.is_completed else 'incomplete'}",
                "data": LessonSerializer(lesson).data,
            }
        )


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for course reviews."""

    serializer_class = ReviewSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "rating"]
    ordering = ["-created_at"]

    def get_permissions(self):
        """
        - Allow anyone to view reviews (list, retrieve)
        - Require authentication for creating, updating, deleting reviews
        """
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):  # type: ignore
        """Filter reviews by course."""
        course_id = self.kwargs.get("course_pk")
        return Review.objects.filter(course_id=course_id).select_related(
            "student", "course"
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create review."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Review submitted successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update review."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Only review owner can update
        if instance.student != request.user:
            return Response(
                {
                    "success": False,
                    "error": {"message": "You can only update your own reviews."},
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Review updated successfully.",
                "data": serializer.data,
            }
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Delete review."""
        instance = self.get_object()

        # Only review owner or admin can delete
        if instance.student != request.user and not request.user.is_admin_user:
            return Response(
                {
                    "success": False,
                    "error": {"message": "You can only delete your own reviews."},
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        self.perform_destroy(instance)
        return Response(
            {
                "success": True,
                "message": "Review deleted successfully.",
            },
            status=status.HTTP_204_NO_CONTENT,
        )


class CourseAnnouncementViewSet(viewsets.ModelViewSet):
    """ViewSet for course-specific announcements."""

    serializer_class = CourseAnnouncementSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action == "create":
            return [IsAuthenticated()]
        return [IsCourseInstructorOrAdmin()]

    def get_queryset(self):  # type: ignore
        course_id = self.kwargs.get("course_pk")
        user = self.request.user
        now = timezone.now()

        queryset = CourseAnnouncement.objects.select_related("course", "created_by")
        if course_id:
            queryset = queryset.filter(course_id=course_id)

        if user.is_admin_user:  # type: ignore
            return queryset

        if user.is_instructor:  # type: ignore
            return queryset.filter(course__instructor=user)

        # Student access: only enrolled students see visible and active announcements
        from apps.enrollments.models import Enrollment

        enrolled_course_ids = Enrollment.objects.filter(student=user).values_list(
            "course_id", flat=True
        )

        queryset = queryset.filter(
            course_id__in=enrolled_course_ids, is_visible=True
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))

        return queryset

    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get("course_pk") or request.data.get("course")
        if not course_id:
            return Response(
                {"success": False, "error": {"message": "Course ID is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Course not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not request.user.is_admin_user and course.instructor != request.user:  # type: ignore
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "You do not have permission to manage announcements for this course."
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course, created_by=request.user)

        return Response(
            {
                "success": True,
                "message": "Course announcement created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset.order_by("-created_at"), many=True)
        return Response({"success": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Course announcement updated successfully.",
                "data": serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "Course announcement deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


from rest_framework.views import APIView


class QuizLookupView(APIView):
    """View to lookup basic quiz details by quiz ID alone (for student redirection/init)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Quiz not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify enrollment for student
        user = request.user
        if not user.is_admin_user and not user.is_instructor:
            from apps.enrollments.models import Enrollment

            if not Enrollment.objects.filter(student=user, course=quiz.course).exists():
                return Response(
                    {
                        "success": False,
                        "error": {
                            "message": "You must be enrolled in this course to access the quiz."
                        },
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        return Response(
            {
                "success": True,
                "data": {
                    "id": str(quiz.id),
                    "course": str(quiz.course.id),
                    "title": quiz.title,
                    "duration_minutes": quiz.duration_minutes,
                    "question_count": quiz.questions.count(),  # type: ignore
                },
            }
        )


class LogWarningView(APIView):
    """View to log anti-cheat warnings and handle auto-disqualification."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        submission_id = request.data.get("submission_id")
        if not submission_id:
            return Response(
                {"success": False, "error": {"message": "submission_id is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            submission = QuizSubmission.objects.get(pk=submission_id)
        except QuizSubmission.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Quiz submission not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if student is authorized for this submission
        if (
            submission.student != request.user
            and not request.user.is_admin_user
            and not request.user.is_instructor
        ):
            return Response(
                {"success": False, "error": {"message": "Unauthorized."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        if submission.completed_at is not None or submission.is_disqualified:
            return Response(
                {
                    "success": True,
                    "data": {
                        "status": (
                            "disqualified"
                            if submission.is_disqualified
                            else "completed"
                        ),
                        "warnings_count": submission.warnings_count,
                        "warnings_remaining": 0,
                        "message": "Submission is already closed or student is disqualified.",
                    },
                }
            )

        # Increment warning count
        submission.warnings_count += 1

        # Check threshold
        if submission.warnings_count >= 3:
            submission.is_disqualified = True
            submission.disqualification_reason = (
                QuizSubmission.DisqualificationReason.EXCESSIVE_WARNINGS
            )
            submission.disqualified_at = timezone.now()
            submission.score = 0
            submission.completed_at = timezone.now()
            submission.save()

            # Notify instructor
            from .notifications import send_disqualification_email

            send_disqualification_email(submission)

            return Response(
                {
                    "success": True,
                    "data": {
                        "status": "disqualified",
                        "warnings_count": submission.warnings_count,
                        "warnings_remaining": 0,
                        "message": "Disqualified due to excessive proctoring violations.",
                    },
                }
            )
        else:
            submission.save()
            return Response(
                {
                    "success": True,
                    "data": {
                        "status": "warning_logged",
                        "warnings_count": submission.warnings_count,
                        "warnings_remaining": 3 - submission.warnings_count,
                        "message": f"Warning logged. {3 - submission.warnings_count} warning(s) remaining.",
                    },
                }
            )


class UndisqualifyStudentView(APIView):
    """View for instructors/admins to un-disqualify a student's quiz submission."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk=None):
        try:
            submission = QuizSubmission.objects.get(pk=pk)
        except QuizSubmission.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Submission not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if the requesting user is the instructor of this course or an admin
        user = request.user
        is_instructor = submission.quiz.course.instructor == user
        is_admin = user.is_admin_user

        if not (is_instructor or is_admin):
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Only the course instructor or an admin can un-disqualify a student."
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Reset proctoring/disqualification fields
        submission.is_disqualified = False
        submission.disqualification_reason = ""
        submission.disqualified_at = None
        submission.warnings_count = 0
        submission.completed_at = None
        submission.score = 0
        submission.save()

        return Response(
            {
                "success": True,
                "message": "Student has been successfully un-disqualified and warnings reset.",
                "data": QuizSubmissionSerializer(submission).data,
            }
        )


class DeleteQuizSubmissionView(APIView):
    """Allow an instructor or admin to permanently delete a quiz submission."""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def delete(self, request, pk=None):
        try:
            submission = QuizSubmission.objects.select_related("quiz__course").get(
                pk=pk
            )
        except QuizSubmission.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Submission not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        is_instructor = submission.quiz.course.instructor == user
        is_admin = user.is_admin_user

        if not (is_instructor or is_admin):
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "Only the course instructor or an admin can delete a quiz submission."
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        submission.delete()
        return Response(
            {"success": True, "message": "Quiz submission deleted successfully."},
            status=status.HTTP_200_OK,
        )


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for Course Quizzes."""

    serializer_class = QuizSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ["list", "retrieve", "start", "submit"]:
            return [IsAuthenticated()]
        return [IsCourseInstructorOrAdmin()]

    def get_queryset(self):  # type: ignore
        course_id = self.kwargs.get("course_pk")
        user = self.request.user
        if not user.is_authenticated:
            return Quiz.objects.none()

        if user.is_instructor or user.is_admin_user:  # type: ignore
            return Quiz.objects.filter(course_id=course_id)

        # For students: they can retrieve, start, or submit a specific quiz detail, but list is empty/hidden
        if self.action in ["retrieve", "start", "submit"]:
            return Quiz.objects.filter(course_id=course_id)
        return Quiz.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Quiz updated successfully.",
                "data": serializer.data,
            }
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get("course_pk")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course_id=course_id)
        return Response(
            {
                "success": True,
                "message": "Quiz created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def start(self, request, course_pk=None, pk=None):
        quiz = self.get_object()
        user = request.user
        pin_code = request.data.get("pin_code")

        # 1. Verify enrollment if student
        if not user.is_admin_user and not user.is_instructor:
            from apps.enrollments.models import Enrollment

            if not Enrollment.objects.filter(student=user, course=quiz.course).exists():
                return Response(
                    {
                        "success": False,
                        "error": {
                            "message": "You must be enrolled in this course to take the quiz."
                        },
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # 2. Verify PIN
        if quiz.pin_code != pin_code:
            return Response(
                {"success": False, "error": {"message": "Invalid PIN code."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Check for existing submission
        submission, created = QuizSubmission.objects.get_or_create(
            quiz=quiz, student=user, defaults={"started_at": timezone.now()}
        )

        is_preview = user.is_admin_user or user.is_instructor

        if not created:
            if not is_preview:
                if submission.is_disqualified:
                    return Response(
                        {
                            "success": False,
                            "error": {
                                "message": "You have been disqualified from this quiz."
                            },
                            "data": QuizSubmissionSerializer(submission).data,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if submission.completed_at is not None:
                    return Response(
                        {
                            "success": False,
                            "error": {
                                "message": "You have already completed this quiz."
                            },
                            "data": QuizSubmissionSerializer(submission).data,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Check time limit
                elapsed_time = timezone.now() - submission.started_at
                allowed_time = elapsed_time.total_seconds() / 60.0
                if allowed_time >= quiz.duration_minutes:
                    submission.completed_at = (
                        submission.started_at
                        + timezone.timedelta(minutes=quiz.duration_minutes)
                    )
                    submission.score = 0
                    submission.total_questions = quiz.questions.count()
                    submission.save()
                    return Response(
                        {
                            "success": False,
                            "error": {
                                "message": "Time has expired for this quiz attempt."
                            },
                            "data": QuizSubmissionSerializer(submission).data,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                if submission.completed_at is not None:
                    # Instructors can preview repeatedly
                    submission.completed_at = None
                    submission.started_at = timezone.now()
                    submission.save()

        # Shuffling logic
        questions = quiz.questions.all()
        q_ids = [str(q.id) for q in questions]

        if not is_preview:
            # Generate deterministic shuffle if not set
            if not submission.shuffled_question_ids:
                import random

                seed = f"{user.id}_{quiz.id}"
                r = random.Random(seed)
                shuffled_ids = q_ids.copy()
                r.shuffle(shuffled_ids)
                submission.shuffled_question_ids = shuffled_ids
                submission.save()

            # Map actual questions to shuffled sequence
            q_map = {str(q.id): q for q in questions}
            ordered_questions = []
            if submission.shuffled_question_ids:
                for q_id in submission.shuffled_question_ids:
                    if q_id in q_map:
                        ordered_questions.append(q_map[q_id])
                # Append any questions that might have been added to the database since quiz start
                for q in questions:
                    if str(q.id) not in submission.shuffled_question_ids:
                        ordered_questions.append(q)
            else:
                ordered_questions = list(questions)
        else:
            ordered_questions = list(questions)

        serializer = QuizStudentQuestionSerializer(ordered_questions, many=True)

        # Calculate remaining seconds
        elapsed_seconds = (timezone.now() - submission.started_at).total_seconds()
        remaining_seconds = max(0, int((quiz.duration_minutes * 60) - elapsed_seconds))

        return Response(
            {
                "success": True,
                "data": {
                    "quiz": QuizSerializer(quiz).data,
                    "questions": serializer.data,
                    "remaining_seconds": remaining_seconds,
                    "submission_id": submission.id,
                    "warnings_count": (
                        submission.warnings_count if not is_preview else 0
                    ),
                    "is_disqualified": (
                        submission.is_disqualified if not is_preview else False
                    ),
                },
            }
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def submit(self, request, course_pk=None, pk=None):
        quiz = self.get_object()
        user = request.user
        answers = request.data.get("answers", [])
        warnings_count = request.data.get("warnings_count", 0)

        try:
            submission = QuizSubmission.objects.get(quiz=quiz, student=user)
        except QuizSubmission.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "error": {"message": "Quiz attempt has not been started."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if submission.is_disqualified:
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "You are disqualified and cannot submit this quiz."
                    },
                    "data": QuizSubmissionSerializer(submission).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if submission.completed_at is not None:
            return Response(
                {
                    "success": False,
                    "error": {"message": "You have already submitted this quiz."},
                    "data": QuizSubmissionSerializer(submission).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate score
        score = 0
        questions = {q.id: q for q in quiz.questions.all()}
        shuffled_ids = submission.shuffled_question_ids or []

        for ans in answers:
            q_id_or_index = ans.get("question_id")
            q_index = ans.get("question_index")
            selected = ans.get("selected_option")

            actual_q_uuid = None

            # 1. Try mapping by index if question_index is specified
            if q_index is not None:
                try:
                    idx = int(q_index)
                    if 0 <= idx < len(shuffled_ids):
                        actual_q_uuid = shuffled_ids[idx]
                except (ValueError, TypeError):
                    pass

            # 2. Try converting question_id to index if it's an integer, otherwise treat it as UUID
            if not actual_q_uuid and q_id_or_index is not None:
                try:
                    idx = int(q_id_or_index)
                    if 0 <= idx < len(shuffled_ids):
                        actual_q_uuid = shuffled_ids[idx]
                except (ValueError, TypeError):
                    # Not an integer index, must be the direct question ID/UUID string
                    actual_q_uuid = q_id_or_index

            if not actual_q_uuid:
                continue

            try:
                import uuid

                q_uuid = (
                    uuid.UUID(str(actual_q_uuid))
                    if isinstance(actual_q_uuid, str)
                    else actual_q_uuid
                )
            except (ValueError, TypeError):
                continue

            if q_uuid in questions:
                correct = questions[q_uuid].correct_option
                if correct == selected:
                    score += 1

        submission.score = score
        submission.total_questions = len(questions)
        submission.warnings_count = warnings_count
        submission.completed_at = timezone.now()
        submission.save()

        # Prepare and send response with required fields
        data = QuizSubmissionSerializer(submission).data
        data.update(
            {
                "score": submission.score,
                "correct_count": submission.score,
                "total_questions": submission.total_questions,
                "warnings_count": submission.warnings_count,
                "is_disqualified": submission.is_disqualified,
            }
        )

        return Response(
            {"success": True, "message": "Quiz submitted successfully.", "data": data}
        )


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Quiz Questions."""

    serializer_class = QuizQuestionSerializer
    permission_classes = [IsCourseInstructorOrAdmin]
    pagination_class = None

    def get_queryset(self):  # type: ignore
        quiz_id = self.kwargs.get("quiz_pk")
        return QuizQuestion.objects.filter(quiz_id=quiz_id)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Question updated successfully.",
                "data": serializer.data,
            }
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        quiz_id = self.kwargs.get("quiz_pk")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(quiz_id=quiz_id)
        return Response(
            {
                "success": True,
                "message": "Question created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyQuizSubmissionsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for students to fetch their own quiz submissions."""

    serializer_class = QuizSubmissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):  # type: ignore
        return QuizSubmission.objects.filter(student=self.request.user).select_related(
            "quiz", "quiz__course"
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})


from rest_framework.exceptions import PermissionDenied
import os


class CourseMaterialViewSet(viewsets.ModelViewSet):
    """ViewSet for Course Materials."""

    serializer_class = CourseMaterialSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "bulk_delete",
        ]:
            return [IsAuthenticated(), IsCourseInstructorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):  # type: ignore
        course_id = self.kwargs.get("course_pk")
        user = self.request.user

        from apps.enrollments.models import Enrollment
        from django.shortcuts import get_object_or_404

        course = get_object_or_404(Course, id=course_id)

        is_enrolled = Enrollment.objects.filter(student=user, course=course).exists()
        is_instructor = course.instructor == user
        is_admin = user.role == "ADMIN"  # type: ignore

        if not (is_enrolled or is_instructor or is_admin):
            raise PermissionDenied(
                "You must be enrolled in this course to access materials."
            )

        return CourseMaterial.objects.filter(course=course)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get("course_pk")
        from django.shortcuts import get_object_or_404

        course = get_object_or_404(Course, id=course_id)

        # Verify permissions
        if course.instructor != request.user and not request.user.is_admin_user:
            raise PermissionDenied(
                "You do not have permission to upload materials to this course."
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Calculate size & type
        file_obj = request.data.get("file")
        file_size = file_obj.size
        ext = os.path.splitext(file_obj.name)[1].lower()

        if ext in [".pdf"]:
            file_type = "PDF"
        elif ext in [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"]:
            file_type = "IMAGE"
        elif ext in [".doc", ".docx", ".odt"]:
            file_type = "WORD"
        elif ext in [".xls", ".xlsx", ".ods"]:
            file_type = "EXCEL"
        elif ext in [".ppt", ".pptx"]:
            file_type = "POWERPOINT"
        elif ext in [".txt"]:
            file_type = "TEXT"
        elif ext in [".zip", ".rar"]:
            file_type = "ARCHIVE"
        else:
            file_type = "OTHER"

        serializer.save(
            course=course,
            uploaded_by=request.user,
            file_size=file_size,
            file_type=file_type,
        )
        return Response(
            {
                "success": True,
                "message": "Material uploaded successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)

        # Calculate size & type if file changed
        file_obj = request.data.get("file")
        if file_obj:
            file_size = file_obj.size
            ext = os.path.splitext(file_obj.name)[1].lower()

            if ext in [".pdf"]:
                file_type = "PDF"
            elif ext in [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"]:
                file_type = "IMAGE"
            elif ext in [".doc", ".docx", ".odt"]:
                file_type = "WORD"
            elif ext in [".xls", ".xlsx", ".ods"]:
                file_type = "EXCEL"
            elif ext in [".ppt", ".pptx"]:
                file_type = "POWERPOINT"
            elif ext in [".txt"]:
                file_type = "TEXT"
            elif ext in [".zip", ".rar"]:
                file_type = "ARCHIVE"
            else:
                file_type = "OTHER"

            # Delete old file
            if instance.file:
                instance.file.delete(save=False)

            serializer.save(file_size=file_size, file_type=file_type)
        else:
            serializer.save()

        return Response(
            {
                "success": True,
                "message": "Material updated successfully.",
                "data": serializer.data,
            }
        )

    def perform_destroy(self, instance):
        # Delete file from storage
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()

    @action(detail=False, methods=["post"], url_path="bulk-delete")
    @transaction.atomic
    def bulk_delete(self, request, *args, **kwargs):
        course_id = self.kwargs.get("course_pk")
        from django.shortcuts import get_object_or_404

        course = get_object_or_404(Course, id=course_id)

        # Manually verify permissions
        if course.instructor != request.user and not request.user.is_admin_user:
            raise PermissionDenied(
                "You do not have permission to delete materials for this course."
            )

        material_ids = request.data.get("ids", [])
        if not material_ids:
            return Response(
                {"success": False, "message": "No material IDs provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        materials = CourseMaterial.objects.filter(course=course, id__in=material_ids)
        deleted_count = 0
        for mat in materials:
            if mat.file:
                mat.file.delete(save=False)
            mat.delete()
            deleted_count += 1

        return Response(
            {
                "success": True,
                "message": f"Successfully deleted {deleted_count} materials.",
            }
        )

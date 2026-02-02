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

from .models import Category, Course, Section, Lesson, Review, CourseStatus
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
)
from accounts.permissions import IsInstructor, IsAdmin, IsInstructorOrAdmin
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
    filterset_fields = ["category", "difficulty_level", "is_free", "status"]
    search_fields = [
        "title",
        "description",
        "instructor__first_name",
        "instructor__last_name",
    ]
    ordering_fields = [
        "created_at",
        "published_at",
        "enrollment_count",
        "average_rating",
        "price",
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

        if not user.is_authenticated or user.is_student:
            return (
                Course.objects.filter(status=CourseStatus.PUBLISHED)
                .select_related("instructor", "category")
                .prefetch_related("sections__lessons")
            )

        if user.is_instructor:
            return (
                Course.objects.filter(
                    Q(instructor=user) | Q(status=CourseStatus.PUBLISHED)
                )
                .select_related("instructor", "category")
                .prefetch_related("sections__lessons")
            )

        if user.is_admin_user:
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


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for course reviews."""

    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "rating"]
    ordering = ["-created_at"]

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

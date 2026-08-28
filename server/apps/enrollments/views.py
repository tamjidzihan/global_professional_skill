from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from .models import Enrollment, LessonProgress, Certificate
from .serializers import (
    EnrollmentSerializer,
    LessonProgressSerializer,
    CertificateSerializer,
)
from apps.courses.models import Course


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["course"]

    def get_queryset(self):  # type: ignore
        user = self.request.user
        if not user.is_authenticated:
            return Enrollment.objects.none()

        if user.is_admin_user: # type: ignore
            return Enrollment.objects.all().select_related("course", "student")

        if user.is_instructor: # type: ignore
            return Enrollment.objects.filter(
                models.Q(course__instructor=user) | models.Q(student=user)
            ).select_related("course", "student").distinct()

        return Enrollment.objects.filter(student=user).select_related(
            "course", "student"
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        course_id = request.data.get("course")
        try:
            course = Course.objects.get(id=course_id, status="PUBLISHED")
        except Course.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Course not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user, course=course
        )

        if created:
            course.enrollment_count += 1
            course.decrease_available_seats()
            course.save(update_fields=["enrollment_count"])

            # Send SMS & Email Notifications for Immediate Course Enrollment
            try:
                from apps.core.notification_service import dispatch_notification
                ctx = {
                    "course_name": course.title,
                    "student_name": request.user.get_full_name() or request.user.email,
                }
                dispatch_notification("SMS_COURSE_APPROVAL", user=request.user, context=ctx)
                dispatch_notification("EMAIL_COURSE_APPROVAL", user=request.user, context=ctx)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send enrollment notifications for free course to {request.user.email}: {str(e)}")

        return Response(
            {
                "success": True,
                "message": "Enrolled successfully" if created else "Already enrolled",
                "data": EnrollmentSerializer(enrollment).data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = []

    def get_queryset(self):  # type: ignore
        if not self.request.user.is_authenticated:
            return LessonProgress.objects.none()
        return LessonProgress.objects.filter(enrollment__student=self.request.user)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def mark_complete(self, request, pk=None):
        progress = self.get_object()
        progress.mark_complete()
        return Response({"success": True, "message": "Lesson marked as complete"})

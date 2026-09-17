from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction, models
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    Enrollment,
    LessonProgress,
    Certificate,
    CourseCertificateConfig,
    CertificateStatus,
    calculate_student_certificate_eligibility,
    check_and_issue_certificate,
)
from .serializers import (
    EnrollmentSerializer,
    LessonProgressSerializer,
    CertificateSerializer,
    CourseCertificateConfigSerializer,
    PublicCertificateVerificationSerializer,
)
from apps.courses.models import Course
from apps.core.models import SiteSettings
import logging

logger = logging.getLogger(__name__)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ["course", "student"]

    def get_queryset(self):  # type: ignore
        user = self.request.user
        if not user.is_authenticated:
            return Enrollment.objects.none()

        if user.is_admin_user:  # type: ignore
            return Enrollment.objects.all().select_related("course", "student", "certificate")

        if user.is_instructor:  # type: ignore
            return Enrollment.objects.filter(
                models.Q(course__instructor=user) | models.Q(student=user)
            ).select_related("course", "student", "certificate").distinct()

        return Enrollment.objects.filter(student=user).select_related(
            "course", "student", "certificate"
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
                logger.error(f"Failed to send enrollment notifications for free course to {request.user.email}: {str(e)}")

        return Response(
            {
                "success": True,
                "message": "Enrolled successfully" if created else "Already enrolled",
                "data": EnrollmentSerializer(enrollment, context={"request": request}).data,
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


class CourseCertificateConfigViewSet(viewsets.ModelViewSet):
    """
    API for managing course-level certificate configuration.
    Only Admins can create, update, or toggle certificate configs.
    """
    serializer_class = CourseCertificateConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not (user.is_admin_user or user.is_staff):  # type: ignore
            return CourseCertificateConfig.objects.none()
        return CourseCertificateConfig.objects.all().select_related("course", "created_by")

    @action(detail=False, methods=["get", "post", "patch"], url_path="course/(?P<course_id>[^/.]+)")
    @transaction.atomic
    def by_course(self, request, course_id=None):
        user = request.user
        if not (user.is_admin_user or user.is_staff):  # type: ignore
            return Response(
                {"success": False, "error": {"message": "Admin authorization required"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        course = get_object_or_404(Course, id=course_id)
        config, created = CourseCertificateConfig.objects.get_or_create(
            course=course,
            defaults={"created_by": user}
        )

        if request.method == "GET":
            return Response({
                "success": True,
                "data": CourseCertificateConfigSerializer(config, context={"request": request}).data
            })

        # POST / PATCH: Update config
        serializer = CourseCertificateConfigSerializer(
            config,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            saved_config = serializer.save(created_by=user)

            # Check and auto-issue certificates for all already-eligible students
            issued_count = 0
            if saved_config.is_active:
                enrollments = Enrollment.objects.filter(
                    course=course,
                    certificate__isnull=True
                ).select_related("student", "course")

                for enrollment in enrollments:
                    cert, was_created, _ = check_and_issue_certificate(
                        enrollment, issued_by=user
                    )
                    if was_created:
                        issued_count += 1

            return Response({
                "success": True,
                "message": f"Certificate configuration saved successfully. {issued_count} eligible certificate(s) issued." if issued_count > 0 else "Certificate configuration saved successfully.",
                "data": CourseCertificateConfigSerializer(saved_config, context={"request": request}).data,
                "auto_issued_count": issued_count
            })

        return Response(
            {"success": False, "error": {"message": "Validation error", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CertificateViewSet(viewsets.ModelViewSet):
    """
    API for certificates: listing, updating, student views, candidate evaluation, and public verification.
    """
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Certificate.objects.none()

        if user.is_admin_user:  # type: ignore
            return Certificate.objects.all().select_related("enrollment", "enrollment__student", "enrollment__course")

        if user.is_instructor:  # type: ignore
            return Certificate.objects.filter(
                enrollment__course__instructor=user
            ).select_related("enrollment", "enrollment__student", "enrollment__course")

        return Certificate.objects.filter(
            enrollment__student=user
        ).select_related("enrollment", "enrollment__course")

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_admin_user or user.is_staff):  # type: ignore
            return Response(
                {"success": False, "error": {"message": "Only admins can edit certificates"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        cert = self.get_object()
        serializer = CertificateSerializer(cert, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            updated_cert = serializer.save(updated_by=user)
            return Response({
                "success": True,
                "message": "Certificate updated successfully",
                "data": CertificateSerializer(updated_cert, context={"request": request}).data
            })
        return Response(
            {"success": False, "error": {"message": "Validation error", "details": serializer.errors}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_certificates(self, request):
        """
        Returns all course enrollments for the logged-in student along with
        their certificate eligibility diagnostics and issued certificate (if any).
        """
        user = request.user
        enrollments = Enrollment.objects.filter(
            student=user
        ).select_related("course", "course__instructor", "certificate").order_by("-enrolled_at")

        results = []
        for e in enrollments:
            eligibility = calculate_student_certificate_eligibility(e)
            cert_data = (
                CertificateSerializer(e.certificate, context={"request": request}).data
                if hasattr(e, "certificate") and e.certificate
                else None
            )

            # Friendly user status message
            if eligibility["eligibility_status"] == "ISSUED":
                status_msg = "Your official certificate has been issued and is available for download."
            elif eligibility["eligibility_status"] == "ELIGIBLE":
                status_msg = "You have completed all course requirements! Your certificate is awaiting admin setup."
            elif eligibility["eligibility_status"] == "QUIZ_NOT_PASSED":
                status_msg = f"Course complete, but average quiz score ({eligibility['average_quiz_score']}%) is below the required pass threshold ({eligibility['quiz_pass_threshold']}%)."
            else:
                status_msg = f"Complete 100% of the course to become eligible for a certificate (current progress: {eligibility['progress_percentage']:.0f}%)."

            results.append({
                "enrollment_id": str(e.id),
                "course": {
                    "id": str(e.course.id),
                    "title": e.course.title,
                    "slug": e.course.slug,
                    "thumbnail": request.build_absolute_uri(e.course.thumbnail.url) if e.course.thumbnail else None,
                    "instructor_name": e.course.instructor.get_full_name() if e.course.instructor else "Instructor",
                },
                "progress_percentage": eligibility["progress_percentage"],
                "course_completed": eligibility["course_completed"],
                "average_quiz_score": eligibility["average_quiz_score"],
                "quiz_pass_threshold": eligibility["quiz_pass_threshold"],
                "quiz_passed": eligibility["quiz_passed"],
                "eligibility_status": eligibility["eligibility_status"],
                "status_message": status_msg,
                "certificate": cert_data,
            })

        return Response({
            "success": True,
            "data": results,
            "summary": {
                "total_enrolled": len(results),
                "earned_certificates": sum(1 for r in results if r["eligibility_status"] == "ISSUED"),
                "in_progress": sum(1 for r in results if r["eligibility_status"] == "NOT_COMPLETED"),
                "awaiting_setup": sum(1 for r in results if r["eligibility_status"] == "ELIGIBLE"),
                "quiz_failed": sum(1 for r in results if r["eligibility_status"] == "QUIZ_NOT_PASSED"),
            }
        })

    @action(detail=False, methods=["get"], url_path="candidates/(?P<course_id>[^/.]+)", permission_classes=[IsAuthenticated])
    def candidates(self, request, course_id=None):
        """
        Admin candidate evaluation endpoint: returns all students enrolled in a course,
        their progress, quiz statistics, and certificate status.
        """
        user = request.user
        if not (user.is_admin_user or user.is_staff):  # type: ignore
            return Response(
                {"success": False, "error": {"message": "Admin authorization required"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        course = get_object_or_404(Course, id=course_id)
        config = getattr(course, "certificate_config", None)
        pass_threshold = float(SiteSettings.get_settings().quiz_pass_percentage or 50.0)

        enrollments = Enrollment.objects.filter(
            course=course
        ).select_related("student", "certificate").order_by("-enrolled_at")

        candidates = []
        for e in enrollments:
            eligibility = calculate_student_certificate_eligibility(e)
            cert_data = (
                CertificateSerializer(e.certificate, context={"request": request}).data
                if hasattr(e, "certificate") and e.certificate
                else None
            )

            candidates.append({
                "enrollment_id": str(e.id),
                "student_id": str(e.student.id),
                "student_name": e.student.get_full_name() or e.student.email,
                "student_email": e.student.email,
                "student_phone": e.student.phone_number or "",
                "organization_name": e.student.organization_name or "",
                "employee_id": e.student.employee_id or "",
                "progress_percentage": eligibility["progress_percentage"],
                "course_completed": eligibility["course_completed"],
                "total_quizzes": eligibility["total_quizzes"],
                "completed_quizzes": eligibility["completed_quizzes"],
                "average_quiz_score": eligibility["average_quiz_score"],
                "quiz_pass_threshold": eligibility["quiz_pass_threshold"],
                "quiz_passed": eligibility["quiz_passed"],
                "eligibility_status": eligibility["eligibility_status"],
                "reason": eligibility["reason"],
                "certificate": cert_data,
            })

        total = len(candidates)
        issued = sum(1 for c in candidates if c["eligibility_status"] == "ISSUED")
        eligible = sum(1 for c in candidates if c["eligibility_status"] == "ELIGIBLE")
        not_eligible = total - issued - eligible

        return Response({
            "success": True,
            "data": {
                "course_id": str(course.id),
                "course_title": course.title,
                "instructor_name": course.instructor.get_full_name() if course.instructor else "Instructor",
                "has_active_config": bool(config and config.is_active),
                "config": CourseCertificateConfigSerializer(config, context={"request": request}).data if config else None,
                "pass_percentage_threshold": pass_threshold,
                "summary": {
                    "total_candidates": total,
                    "issued_count": issued,
                    "eligible_count": eligible,
                    "not_eligible_count": not_eligible,
                },
                "candidates": candidates,
            }
        })

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def manual_issue(self, request):
        """
        Admin endpoint to manually issue or re-issue a certificate for a student enrollment.
        """
        user = request.user
        if not (user.is_admin_user or user.is_staff):  # type: ignore
            return Response(
                {"success": False, "error": {"message": "Admin authorization required"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment_id = request.data.get("enrollment_id")
        custom_name = request.data.get("student_name")
        enrollment = get_object_or_404(Enrollment, id=enrollment_id)

        cert, created, reason = check_and_issue_certificate(
            enrollment,
            issued_by=user,
            custom_student_name=custom_name
        )

        if not cert:
            return Response(
                {"success": False, "error": {"message": reason}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "success": True,
            "message": "Certificate issued successfully" if created else "Certificate already issued",
            "data": CertificateSerializer(cert, context={"request": request}).data
        })

    @action(detail=False, methods=["get"], url_path="verify/(?P<certificate_number>[^/.]+)", permission_classes=[AllowAny])
    def verify(self, request, certificate_number=None):
        """
        Public verification endpoint. Does not require authentication.
        Exposes safe credential details without private personal contact information.
        """
        if not certificate_number:
            return Response(
                {"success": False, "error": {"message": "Certificate number is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        clean_number = certificate_number.strip().upper()

        try:
            cert = Certificate.objects.select_related(
                "enrollment", "enrollment__course"
            ).get(certificate_number__iexact=clean_number)
        except Certificate.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "valid": False,
                    "message": "Certificate not found. The certificate number you entered could not be verified.",
                    "certificate_number": clean_number,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        verification_url = f"{frontend_url}/certificate/verify/{cert.certificate_number}"

        logo_url = None
        if cert.logo_image:
            logo_url = request.build_absolute_uri(cert.logo_image.url)

        signature_url = None
        if cert.signature_image:
            signature_url = request.build_absolute_uri(cert.signature_image.url)

        additional_signature_url = None
        if cert.additional_signature_image:
            additional_signature_url = request.build_absolute_uri(cert.additional_signature_image.url)

        is_valid = (cert.status == CertificateStatus.ISSUED)

        verification_data = {
            "valid": is_valid,
            "certificate_number": cert.certificate_number,
            "student_name": cert.student_name,
            "course_name": cert.course_name,
            "organization_name": cert.organization_name,
            "issue_date": cert.issue_date,
            "status": "VALID" if is_valid else "REVOKED",
            "template_id": cert.template_id,
            "authorizer_name": cert.authorizer_name,
            "authorizer_position": cert.authorizer_position,
            "has_signature": bool(cert.signature_image),
            "signature_url": signature_url,
            "signature_size": getattr(cert, "signature_size", 100) or 100,
            "enable_additional_authorizer": getattr(cert, "enable_additional_authorizer", False),
            "additional_authorizer_name": getattr(cert, "additional_authorizer_name", "") or "",
            "additional_authorizer_position": getattr(cert, "additional_authorizer_position", "") or "",
            "has_additional_signature": bool(cert.additional_signature_image),
            "additional_signature_url": additional_signature_url,
            "additional_signature_size": getattr(cert, "additional_signature_size", 100) or 100,
            "logo_url": logo_url,
            "logo_size": getattr(cert, "logo_size", 100) or 100,
            "issued_at": cert.issued_at,
            "verification_url": verification_url,
        }

        serializer = PublicCertificateVerificationSerializer(verification_data)

        return Response({
            "success": True,
            "valid": is_valid,
            "data": serializer.data
        })



"""
Views for user accounts and authentication.
"""

import logging

from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    EmailVerificationToken,
    InstructorRequest,
    PasswordResetToken,
    User,
    UserRole,
)
from .permissions import IsAdmin, IsOwnerOrAdmin
from .serializers import (
    EmailVerificationSerializer,
    InstructorRequestReviewSerializer,
    InstructorRequestSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserRoleUpdateSerializer,
    UserSerializer,
    AdminUserUpdateSerializer,
    ResendVerificationEmailSerializer,
)
from .tasks import (
    send_instructor_request_decision_email,
    send_instructor_request_notification,
    send_verification_email,
    send_verification_sms,
    send_password_reset_email,
    send_password_reset_sms,
    get_or_create_password_reset_token,
)

logger = logging.getLogger(__name__)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    All users register as Student by default.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Registration successful. Verification instructions have been sent to your email and mobile number via SMS.",
                "data": {"user": UserSerializer(user).data},
            },
            status=status.HTTP_201_CREATED,
        )


class EmailVerificationView(generics.GenericAPIView):
    """Email and Phone account verification endpoint."""

    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            with transaction.atomic():
                verification_token = (
                    EmailVerificationToken.objects.select_for_update()
                    .select_related("user")
                    .get(token=token)
                )

                if verification_token.is_expired():
                    return Response(
                        {
                            "success": False,
                            "error": {"message": "Verification token has expired."},
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Verify user account (email & phone)
                user = verification_token.user
                was_already_verified = user.email_verified and user.phone_verified

                user.email_verified = True
                user.phone_verified = True
                user.save(update_fields=["email_verified", "phone_verified"])

                # Delete used token immediately in transaction
                verification_token.delete()

            logger.info(f"Account verified for user {user.email}")

            # Trigger confirmation notifications only on fresh verification
            if not was_already_verified:
                try:
                    from apps.core.notification_service import dispatch_notification
                    dispatch_notification("SMS_STUDENT_VERIFICATION", user=user)
                    dispatch_notification("EMAIL_STUDENT_VERIFICATION", user=user)
                except Exception as e:
                    logger.error(f"Error triggering verification notifications for {user.email}: {str(e)}")

            return Response(
                {
                    "success": True,
                    "message": "Account verified successfully. You can now log in.",
                    "data": {
                        "user": UserSerializer(user).data,
                        "email_verified": True,
                        "phone_verified": True,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except EmailVerificationToken.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Invalid or already used verification token."}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserLoginView(TokenObtainPairView):
    """
    User login endpoint.
    Returns JWT access and refresh tokens.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]  # type: ignore

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),  # type: ignore
                        "refresh": str(refresh),
                    },
                },
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):  # type: ignore
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class PasswordChangeView(generics.GenericAPIView):
    """Change password endpoint."""

    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"success": True, "message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(generics.GenericAPIView):
    """Request password reset endpoint."""

    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "message": "If the email exists, a password reset link has been sent.",
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset endpoint."""

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            reset_token = PasswordResetToken.objects.select_related("user").get(
                token=token
            )

            if reset_token.is_expired():
                return Response(
                    {
                        "success": False,
                        "error": {"message": "Password reset token has expired."},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reset password
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            # Mark token as used
            reset_token.used = True
            reset_token.save()

            logger.info(f"Password reset for user {user.email}")

            return Response(
                {
                    "success": True,
                    "message": "Password reset successfully. You can now log in with your new password.",
                },
                status=status.HTTP_200_OK,
            )

        except PasswordResetToken.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "error": {"message": "Invalid password reset token."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class InstructorRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for instructor role requests.
    - Students can create requests
    - Admins can review and approve/reject
    """

    serializer_class = InstructorRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):  # type: ignore
        # Add swagger_fake_view check at the beginning
        if getattr(self, "swagger_fake_view", False):
            return InstructorRequest.objects.none()

        user = self.request.user

        # Check if user is authenticated
        if not user.is_authenticated:
            return InstructorRequest.objects.none()

        # Now safely check the attribute
        if hasattr(user, "is_admin_user") and user.is_admin_user:  # type: ignore
            return InstructorRequest.objects.all()

        # For regular users, return only their requests
        return InstructorRequest.objects.filter(user=user)

    def get_serializer_class(self):  # type: ignore
        """Use different serializers for different actions."""
        if self.action == "review":
            return InstructorRequestReviewSerializer
        return InstructorRequestSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create instructor request."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instructor_request = serializer.save()

        # Send notification to admins
        send_instructor_request_notification(str(instructor_request.id))

        return Response(
            {
                "success": True,
                "message": "Instructor request submitted successfully. You will be notified once reviewed.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def review(self, request, pk=None):
        """
        Review instructor request (Admin only).
        Approve or reject the request.
        """
        instructor_request = self.get_object()

        if instructor_request.status != "PENDING":
            return Response(
                {
                    "success": False,
                    "error": {"message": "This request has already been reviewed."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            instructor_request, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Send decision email to user
        send_instructor_request_decision_email(str(instructor_request.id))

        return Response(
            {
                "success": True,
                "message": f'Request {serializer.validated_data["status"].lower()} successfully.',
                "data": InstructorRequestSerializer(instructor_request).data,
            },
            status=status.HTTP_200_OK,
        )

    def list(self, request, *args, **kwargs):
        """List instructor requests."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve instructor request."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    User management viewset (Admin only).
    Admins can view, update roles, manage users, and execute full administrative actions.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_active", "email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "last_login", "email"]
    ordering = ["-date_joined"]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return AdminUserUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=["patch"])
    @transaction.atomic
    def update_role(self, request, pk=None):
        """Update user role (Admin only)."""
        user = self.get_object()
        serializer = UserRoleUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "message": f'User role updated to {serializer.validated_data["role"]}.',
                "data": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def deactivate(self, request, pk=None):
        """Deactivate user account."""
        user = self.get_object()

        if (
            user.is_admin_user
            and User.objects.filter(role=UserRole.ADMIN, is_active=True).count() <= 1
        ):
            return Response(
                {
                    "success": False,
                    "error": {"message": "Cannot deactivate the last active admin."},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save(update_fields=["is_active"])

        return Response(
            {"success": True, "message": "User account deactivated successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def activate(self, request, pk=None):
        """Activate user account."""
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {"success": True, "message": "User account activated successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"])
    def full_detail(self, request, pk=None):
        """
        Get complete user profile with enrolled courses, quiz submissions,
        payment transactions, and aggregated platform stats.
        """
        from django.db import models
        user = self.get_object()
        from apps.enrollments.models import Enrollment, Certificate
        from apps.courses.models import Course, Lesson, QuizSubmission
        from apps.payments.models import Payment

        # 1. Enrolled Courses
        enrollments = Enrollment.objects.filter(student=user).select_related(
            "course", "course__category", "course__instructor"
        ).order_by("-enrolled_at")

        enrollments_data = []
        for e in enrollments:
            course = e.course
            total_lessons = (
                course.sections.aggregate(total=models.Count("lessons"))["total"] or 0
            )
            completed_lessons_count = e.lesson_progress.filter(completed=True).count()
            cert = Certificate.objects.filter(enrollment=e).first()

            enrollments_data.append({
                "id": str(e.id),
                "course_id": str(course.id),
                "course_title": course.title,
                "course_slug": getattr(course, "slug", ""),
                "course_thumbnail": request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                "course_price": str(course.price),
                "delivery_mode": course.delivery_mode,
                "instructor_name": course.instructor.get_full_name() or course.instructor.email if course.instructor else "GPI Instructor",
                "category_name": course.category.name if course.category else "Uncategorized",
                "progress_percentage": float(e.progress_percentage),
                "completed_lessons_count": completed_lessons_count,
                "total_lessons_count": total_lessons,
                "enrolled_at": e.enrolled_at,
                "last_accessed": e.last_accessed,
                "completed_at": e.completed_at,
                "is_completed": bool(e.completed_at or e.progress_percentage >= 100),
                "certificate": {
                    "id": str(cert.id),
                    "certificate_number": cert.certificate_number,
                    "issued_at": cert.issued_at,
                } if cert else None,
            })

        # 2. Quiz Submissions
        from apps.core.models import SiteSettings
        site_settings = SiteSettings.get_settings()
        pass_percentage = float(site_settings.quiz_pass_percentage or 50.0)

        quiz_submissions = QuizSubmission.objects.filter(student=user).select_related(
            "quiz", "quiz__course"
        ).order_by("-completed_at", "-started_at")

        submissions_data = []
        for s in quiz_submissions:
            total_q = s.total_questions or (s.quiz.questions.count() if s.quiz else 0)
            score_val = s.score or 0
            pct = round((score_val / total_q * 100), 1) if total_q > 0 else 0.0
            is_passed = pct >= pass_percentage and not s.is_disqualified and bool(s.completed_at)

            submissions_data.append({
                "id": str(s.id),
                "quiz_id": str(s.quiz.id) if s.quiz else None,
                "quiz_title": s.quiz.title if s.quiz else "Quiz",
                "course_id": str(s.quiz.course.id) if (s.quiz and s.quiz.course) else None,
                "course_title": s.quiz.course.title if (s.quiz and s.quiz.course) else "N/A",
                "score": score_val,
                "total_marks": total_q,
                "percentage": pct,
                "passed": is_passed,
                "is_disqualified": bool(s.is_disqualified),
                "disqualification_reason": s.disqualification_reason or ("Excessive Warnings" if s.is_disqualified else None),
                "warnings_count": s.warnings_count or 0,
                "copy_count": 0,
                "blur_count": s.warnings_count or 0,
                "fullscreen_exit_count": 0,
                "attempt_number": 1,
                "started_at": s.started_at,
                "submitted_at": s.completed_at,
                "completed_at": s.completed_at,
            })

        # 3. Payments
        payments = Payment.objects.filter(user=user).select_related("course").order_by("-created_at")
        payments_data = []
        for p in payments:
            payments_data.append({
                "id": str(p.id),
                "course_id": str(p.course.id) if p.course else None,
                "course_title": p.course.title if p.course else "N/A",
                "amount": float(p.amount),
                "payment_method": p.payment_method,
                "transaction_id": p.transaction_id,
                "sender_number": p.sender_number,
                "status": p.status,
                "metadata": p.metadata,
                "created_at": p.created_at,
                "completed_at": p.completed_at,
            })

        # 4. Computed Stats
        total_enrollments = len(enrollments_data)
        completed_courses = sum(1 for e in enrollments_data if e["is_completed"])
        in_progress_courses = total_enrollments - completed_courses
        total_quizzes = len(submissions_data)
        avg_score = (
            sum(s["percentage"] for s in submissions_data) / total_quizzes
            if total_quizzes > 0
            else 0.0
        )
        total_spent = sum(p["amount"] for p in payments_data if p["status"] == "COMPLETED")

        stats = {
            "total_enrollments": total_enrollments,
            "completed_courses": completed_courses,
            "in_progress_courses": in_progress_courses,
            "total_quizzes_taken": total_quizzes,
            "average_quiz_score": round(avg_score, 1),
            "total_spent": round(total_spent, 2),
        }

        return Response(
            {
                "success": True,
                "data": {
                    "user": UserSerializer(user, context={"request": request}).data,
                    "stats": stats,
                    "enrollments": enrollments_data,
                    "quiz_submissions": submissions_data,
                    "payments": payments_data,
                },
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def manual_enroll(self, request, pk=None):
        """Manually enroll user in a course."""
        user = self.get_object()
        course_id = request.data.get("course_id")
        if not course_id:
            return Response(
                {"success": False, "error": {"message": "course_id is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from apps.courses.models import Course
        from apps.enrollments.models import Enrollment

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Course not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        enrollment, created = Enrollment.objects.get_or_create(student=user, course=course)
        if created:
            course.enrollment_count += 1
            course.decrease_available_seats()
            course.save(update_fields=["enrollment_count"])

        return Response(
            {
                "success": True,
                "message": f"User successfully enrolled in {course.title}." if created else "User is already enrolled in this course.",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def unenroll(self, request, pk=None):
        """Unenroll user from a course."""
        user = self.get_object()
        course_id = request.data.get("course_id")
        if not course_id:
            return Response(
                {"success": False, "error": {"message": "course_id is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from apps.enrollments.models import Enrollment

        try:
            enrollment = Enrollment.objects.get(student=user, course_id=course_id)
            course = enrollment.course
            enrollment.delete()
            if course.enrollment_count > 0:
                course.enrollment_count -= 1
                course.save(update_fields=["enrollment_count"])
            return Response(
                {"success": True, "message": "User unenrolled successfully."},
                status=status.HTTP_200_OK,
            )
        except Enrollment.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Enrollment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def toggle_verification(self, request, pk=None):
        """Toggle or set email_verified or phone_verified for a user."""
        user = self.get_object()
        field_type = request.data.get("type", "email")
        new_status = request.data.get("status")

        if field_type == "email":
            user.email_verified = not user.email_verified if new_status is None else bool(new_status)
            user.save(update_fields=["email_verified"])
            msg = f"Email verification set to {user.email_verified}."
        elif field_type == "phone":
            user.phone_verified = not user.phone_verified if new_status is None else bool(new_status)
            user.save(update_fields=["phone_verified"])
            msg = f"Phone verification set to {user.phone_verified}."
        else:
            return Response(
                {"success": False, "error": {"message": "Invalid type. Must be 'email' or 'phone'."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"success": True, "message": msg, "data": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def send_password_reset(self, request, pk=None):
        """Send password reset email and SMS to user."""
        user = self.get_object()
        token = get_or_create_password_reset_token(user)
        email_sent = send_password_reset_email(str(user.id), token_str=token)
        sms_sent = False
        if user.phone_number:
            sms_sent = send_password_reset_sms(str(user.id), token_str=token)

        if email_sent or sms_sent:
            return Response(
                {"success": True, "message": f"Password reset notification sent to {user.email}."},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"success": False, "error": {"message": "Failed to send password reset notification."}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    @action(detail=True, methods=["post"])
    def send_verification(self, request, pk=None):
        """Send verification email and SMS to user."""
        user = self.get_object()
        send_verification_email(str(user.id))
        if user.phone_number:
            send_verification_sms(str(user.id))
        return Response(
            {"success": True, "message": f"Verification instructions dispatched to {user.email}."},
            status=status.HTTP_200_OK,
        )

    def list(self, request, *args, **kwargs):
        """List users."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve user."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Admin update user profile."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "success": True,
                "message": "User updated successfully.",
                "data": UserSerializer(instance).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def download(self, request):
        """Download all users as CSV with organization_name and employee_id."""
        import csv
        from django.http import HttpResponse

        # Get all users (no pagination)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create CSV response
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="all_users.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            "ID",
            "Email",
            "First Name",
            "Last Name",
            "Full Name",
            "Role",
            "Organization Name",
            "Employee ID",
            "Phone Number",
            "Email Verified",
            "Phone Verified",
            "Is Active",
            "Date Joined",
            "Last Login",
        ])
        
        # Write user data
        for user in queryset:
            writer.writerow([
                str(user.id),
                user.email,
                user.first_name,
                user.last_name,
                user.get_full_name(),
                user.role,
                user.organization_name or "",
                user.employee_id or "",
                user.phone_number or "",
                "Yes" if user.email_verified else "No",
                "Yes" if user.phone_verified else "No",
                "Yes" if user.is_active else "No",
                user.date_joined.strftime("%Y-%m-%d %H:%M:%S") if user.date_joined else "",
                user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else "",
            ])
        
        return response


class ResendVerificationEmailView(generics.GenericAPIView):
    """Endpoint to resend verification email and/or SMS."""

    serializer_class = ResendVerificationEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        channel = serializer.validated_data.get("channel", "both")
        if channel == "sms":
            msg = "Verification SMS has been resent. Please check your phone messages."
        elif channel == "email":
            msg = "Verification email has been resent. Please check your inbox."
        else:
            msg = "Verification instructions have been resent to your email and phone."

        return Response(
            {
                "success": True,
                "message": msg,
            },
            status=status.HTTP_200_OK,
        )

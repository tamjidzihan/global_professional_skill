"""
Views for user accounts and authentication.
"""

from rest_framework import status, generics, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    User,
    EmailVerificationToken,
    PasswordResetToken,
    InstructorRequest,
    UserRole,
)
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    EmailVerificationSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    InstructorRequestSerializer,
    InstructorRequestReviewSerializer,
    UserRoleUpdateSerializer,
)
from .permissions import IsAdmin, IsOwnerOrAdmin
from .tasks import (
    send_instructor_request_notification,
    send_instructor_request_decision_email,
)
import logging

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
                "message": "Registration successful. Please check your email to verify your account.",
                "data": {"user": UserSerializer(user).data},
            },
            status=status.HTTP_201_CREATED,
        )


class EmailVerificationView(generics.GenericAPIView):
    """Email verification endpoint."""

    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            verification_token = EmailVerificationToken.objects.select_related(
                "user"
            ).get(token=token)

            if verification_token.is_expired():
                return Response(
                    {
                        "success": False,
                        "error": {"message": "Verification token has expired."},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verify user email
            user = verification_token.user
            user.email_verified = True
            user.save(update_fields=["email_verified"])

            # Delete used token
            verification_token.delete()

            logger.info(f"Email verified for user {user.email}")

            return Response(
                {
                    "success": True,
                    "message": "Email verified successfully. You can now log in.",
                },
                status=status.HTTP_200_OK,
            )

        except EmailVerificationToken.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Invalid verification token."}},
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

        user = serializer.validated_data["user"]

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
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

    def get_object(self):
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

    def get_queryset(self):
        # Add swagger_fake_view check at the beginning
        if getattr(self, "swagger_fake_view", False):
            return InstructorRequest.objects.none()

        user = self.request.user

        # Check if user is authenticated
        if not user.is_authenticated:
            return InstructorRequest.objects.none()

        # Now safely check the attribute
        if hasattr(user, "is_admin_user") and user.is_admin_user:
            return InstructorRequest.objects.all()

        # For regular users, return only their requests
        return InstructorRequest.objects.filter(user=user)

    def get_serializer_class(self):
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
    Admins can view, update roles, and manage users.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_active", "email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "last_login", "email"]
    ordering = ["-date_joined"]
    queryset = User.objects.all()

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

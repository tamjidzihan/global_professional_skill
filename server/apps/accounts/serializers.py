"""
Serializers for user accounts and authentication.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, InstructorRequest, UserRole, EmailVerificationToken
import re
import secrets
from datetime import timedelta
from .tasks import send_verification_email, send_verification_sms, send_password_reset_email


def normalize_bd_phone(phone: str) -> str:
    """Validate and normalize Bangladesh phone numbers to +8801XXXXXXXXX."""
    if not phone:
        return ""
    cleaned = re.sub(r"[\s\-()]", "", str(phone).strip())
    match = re.match(r"^(?:\+88|88)?(01[3-9]\d{8})$", cleaned)
    if not match:
        return ""
    return f"+88{match.group(1)}"


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "bio",
            "profile_picture",
            "phone_number",
            "phone_verified",
            "organization_name",
            "employee_id",
            "email_verified",
            "is_active",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "email_verified",
            "phone_verified",
            "is_active",
            "date_joined",
            "last_login",
        )

    def get_full_name(self, obj):
        return obj.get_full_name()

    def update(self, instance, validated_data):
        if "phone_number" in validated_data and validated_data["phone_number"]:
            normalized = normalize_bd_phone(validated_data["phone_number"])
            if not normalized:
                raise serializers.ValidationError(
                    {"phone_number": "Please enter a valid Bangladesh mobile number."}
                )
            if (
                User.objects.filter(phone_number=normalized)
                .exclude(id=instance.id)
                .exists()
            ):
                raise serializers.ValidationError(
                    {"phone_number": "A user with this mobile number already exists."}
                )
            validated_data["phone_number"] = normalized

        if "employee_id" in validated_data and validated_data["employee_id"]:
            emp_id = str(validated_data["employee_id"]).strip()
            if (
                emp_id
                and User.objects.filter(employee_id__iexact=emp_id)
                .exclude(id=instance.id)
                .exists()
            ):
                raise serializers.ValidationError(
                    {"employee_id": "A user with this Employee ID already exists."}
                )
            validated_data["employee_id"] = emp_id or None

        return super().update(instance, validated_data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    phone_number = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Mobile number is required.",
            "blank": "Mobile number cannot be blank.",
        },
    )
    organization_name = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=255
    )
    employee_id = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=100
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone_number",
            "organization_name",
            "employee_id",
        )

    def validate_phone_number(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Mobile number is required.")

        normalized = normalize_bd_phone(value)
        if not normalized:
            raise serializers.ValidationError(
                "Please enter a valid Bangladesh mobile number (e.g., +8801712345678 or 01712345678)."
            )

        if User.objects.filter(phone_number=normalized).exists():
            raise serializers.ValidationError(
                "A user with this mobile number already exists."
            )

        return normalized

    def validate_employee_id(self, value):
        if value:
            stripped = str(value).strip()
            if stripped and User.objects.filter(employee_id__iexact=stripped).exists():
                raise serializers.ValidationError(
                    "A user with this Employee ID already exists."
                )
            return stripped
        return ""

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        """Create new user with Student role by default."""
        validated_data.pop("password_confirm")

        phone = validated_data.get("phone_number", "")
        org_name = validated_data.get("organization_name", "")
        emp_id = validated_data.get("employee_id", "") or None

        user = User.objects.create_user(  # type: ignore
            email=validated_data["email"],
            password=validated_data["password"],
            phone_number=phone,
            organization_name=org_name,
            employee_id=emp_id,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=UserRole.STUDENT,  # Default role
            is_active=True,
            email_verified=False,
            phone_verified=False,
        )

        # Generate verification token & dispatch email and SMS
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        EmailVerificationToken.objects.create(
            user=user, token=token, expires_at=expires_at
        )

        send_verification_email(user.id, token)
        send_verification_sms(user.id, token)

        return user



class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"email": "No account found with this email address."}
                )

            # Check if email is verified
            if not user.email_verified:
                raise serializers.ValidationError(
                    {"email": "Please verify your email address before logging in."}
                )

            # Check if account is active
            if not user.is_active:
                raise serializers.ValidationError(
                    {"email": "This account has been deactivated."}
                )

            # Authenticate user
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError({"password": "Incorrect password."})

            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            attrs["user"] = user
        else:
            raise serializers.ValidationError(
                {"error": 'Must include "email" and "password".'}
            )

        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""

    token = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password": "New password fields didn't match."}
            )
        return attrs

    def save(self):  # type: ignore
        """Update user password."""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])  # type: ignore
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Validate that user with this email exists."""
        try:
            user = User.objects.get(email=value, is_active=True)
            self.context["user"] = user
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        return value

    def save(self):  # type: ignore
        """Send password reset email."""
        user = self.context.get("user")
        if user:
            send_password_reset_email(user.id)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""

    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password": "Password fields didn't match."}
            )
        return attrs


class InstructorRequestSerializer(serializers.ModelSerializer):
    """Serializer for instructor role requests."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    reviewed_by_email = serializers.EmailField(
        source="reviewed_by.email", read_only=True
    )

    class Meta:
        model = InstructorRequest
        fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "status",
            "reason",
            "qualifications",
            "teaching_interests",
            "reviewed_by",
            "reviewed_by_email",
            "review_notes",
            "created_at",
            "updated_at",
            "reviewed_at",
        )
        read_only_fields = (
            "id",
            "user",
            "status",
            "reviewed_by",
            "review_notes",
            "created_at",
            "updated_at",
            "reviewed_at",
        )

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def validate(self, attrs):
        """Validate instructor request."""
        user = self.context["request"].user

        # Check if user already has an instructor role
        if user.role == UserRole.INSTRUCTOR:
            raise serializers.ValidationError("You are already an instructor.")

        # Check if user has a pending request
        if InstructorRequest.objects.filter(user=user, status="PENDING").exists():
            raise serializers.ValidationError(
                "You already have a pending instructor request."
            )

        return attrs

    def create(self, validated_data):
        """Create instructor request."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class InstructorRequestReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviewing instructor requests (Admin only)."""

    class Meta:
        model = InstructorRequest
        fields = ("status", "review_notes")

    def validate_status(self, value):
        """Validate status transition."""
        if value not in ["APPROVED", "REJECTED"]:
            raise serializers.ValidationError(
                "Status must be either APPROVED or REJECTED."
            )
        return value

    def update(self, instance, validated_data):
        """Update instructor request and user role if approved."""
        instance.status = validated_data["status"]
        instance.review_notes = validated_data.get("review_notes", "")
        instance.reviewed_by = self.context["request"].user
        instance.reviewed_at = timezone.now()
        instance.save()

        # If approved, update user role
        if instance.status == "APPROVED":
            user = instance.user
            user.role = UserRole.INSTRUCTOR
            user.save(update_fields=["role"])

        return instance


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user roles (Admin only)."""

    class Meta:
        model = User
        fields = ("role",)

    def validate_role(self, value):
        """Validate role."""
        if value not in [UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]:
            raise serializers.ValidationError("Invalid role.")
        return value


class ResendVerificationEmailSerializer(serializers.Serializer):
    """Serializer for resending verification email and/or SMS."""

    email = serializers.EmailField(required=True)
    channel = serializers.ChoiceField(
        choices=["email", "sms", "both"], default="both", required=False
    )

    def validate_email(self, value):
        """Validate that user with this email exists and is not verified."""
        try:
            user = User.objects.get(email=value)
            if user.email_verified:
                raise serializers.ValidationError("This account is already verified.")
            if not user.is_active:
                raise serializers.ValidationError("This account is deactivated.")
            self.context["user"] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this email address.")
        return value

    def validate(self, attrs):
        user = self.context.get("user")
        if user:
            # Check 60-second cooldown on verification token resends
            from .models import EmailVerificationToken

            last_token = (
                EmailVerificationToken.objects.filter(user=user)
                .order_by("-created_at")
                .first()
            )
            if last_token:
                elapsed_seconds = (timezone.now() - last_token.created_at).total_seconds()
                if elapsed_seconds < 60:
                    wait_seconds = int(60 - elapsed_seconds)
                    raise serializers.ValidationError(
                        f"Please wait {wait_seconds} seconds before requesting another verification message."
                    )
        return attrs

    def save(self):
        """Resend verification token via requested channel(s)."""
        user = self.context.get("user")
        channel = self.validated_data.get("channel", "both")
        if user:
            from .models import EmailVerificationToken

            token = secrets.token_urlsafe(32)
            expires_at = timezone.now() + timedelta(hours=24)
            # Remove old tokens
            EmailVerificationToken.objects.filter(user=user).delete()
            EmailVerificationToken.objects.create(
                user=user, token=token, expires_at=expires_at
            )

            if channel in ["email", "both"]:
                send_verification_email(user.id, token)
            if channel in ["sms", "both"]:
                send_verification_sms(user.id, token)

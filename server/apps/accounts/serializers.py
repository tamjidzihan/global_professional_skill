"""
Serializers for user accounts and authentication.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, InstructorRequest, UserRole
from .utils import send_verification_email, send_password_reset_email
import secrets


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'bio', 'profile_picture', 'phone_number',
            'email_verified', 'is_active', 'date_joined', 'last_login'
        )
        read_only_fields = ('id', 'email', 'role', 'email_verified', 'is_active', 'date_joined', 'last_login')
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name')
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user with Student role by default."""
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=UserRole.STUDENT,  # Default role
            is_active=True,
            email_verified=False
        )
        
        # Send verification email asynchronously
        send_verification_email(user.id)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'email': 'No account found with this email address.'
                })
            
            # Check if email is verified
            if not user.email_verified:
                raise serializers.ValidationError({
                    'email': 'Please verify your email address before logging in.'
                })
            
            # Check if account is active
            if not user.is_active:
                raise serializers.ValidationError({
                    'email': 'This account has been deactivated.'
                })
            
            # Authenticate user
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError({
                    'password': 'Incorrect password.'
                })
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError({
                'error': 'Must include "email" and "password".'
            })
        
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs
    
    def save(self):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that user with this email exists."""
        try:
            user = User.objects.get(email=value, is_active=True)
            self.context['user'] = user
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        return value
    
    def save(self):
        """Send password reset email."""
        user = self.context.get('user')
        if user:
            send_password_reset_email(user.id)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class InstructorRequestSerializer(serializers.ModelSerializer):
    """Serializer for instructor role requests."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    reviewed_by_email = serializers.EmailField(source='reviewed_by.email', read_only=True)
    
    class Meta:
        model = InstructorRequest
        fields = (
            'id', 'user', 'user_email', 'user_name', 'status',
            'reason', 'qualifications', 'teaching_interests',
            'reviewed_by', 'reviewed_by_email', 'review_notes',
            'created_at', 'updated_at', 'reviewed_at'
        )
        read_only_fields = (
            'id', 'user', 'status', 'reviewed_by', 'review_notes',
            'created_at', 'updated_at', 'reviewed_at'
        )
    
    def get_user_name(self, obj):
        return obj.user.get_full_name()
    
    def validate(self, attrs):
        """Validate instructor request."""
        user = self.context['request'].user
        
        # Check if user already has an instructor role
        if user.role == UserRole.INSTRUCTOR:
            raise serializers.ValidationError(
                "You are already an instructor."
            )
        
        # Check if user has a pending request
        if InstructorRequest.objects.filter(
            user=user,
            status='PENDING'
        ).exists():
            raise serializers.ValidationError(
                "You already have a pending instructor request."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create instructor request."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class InstructorRequestReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviewing instructor requests (Admin only)."""
    
    class Meta:
        model = InstructorRequest
        fields = ('status', 'review_notes')
    
    def validate_status(self, value):
        """Validate status transition."""
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError(
                "Status must be either APPROVED or REJECTED."
            )
        return value
    
    def update(self, instance, validated_data):
        """Update instructor request and user role if approved."""
        instance.status = validated_data['status']
        instance.review_notes = validated_data.get('review_notes', '')
        instance.reviewed_by = self.context['request'].user
        instance.reviewed_at = timezone.now()
        instance.save()
        
        # If approved, update user role
        if instance.status == 'APPROVED':
            user = instance.user
            user.role = UserRole.INSTRUCTOR
            user.save(update_fields=['role'])
        
        return instance


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user roles (Admin only)."""
    
    class Meta:
        model = User
        fields = ('role',)
    
    def validate_role(self, value):
        """Validate role."""
        if value not in [UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]:
            raise serializers.ValidationError("Invalid role.")
        return value

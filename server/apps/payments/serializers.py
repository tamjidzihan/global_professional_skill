from rest_framework import serializers
from .models import Payment, PaymentStatus
from apps.courses.models import Course


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_email",
            "course",
            "course_title",
            "amount",
            "currency",
            "status",
            "transaction_id",
            "payment_method",
            "created_at",
            "completed_at",
            "metadata",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "transaction_id",
            "created_at",
            "completed_at",
        ]

    def validate_course(self, value):
        """Ensure the course is published and valid for payment."""
        if not value.is_published:
            raise serializers.ValidationError("Only published courses can be purchased.")
        
        # Check if the course is free
        if value.is_free:
            raise serializers.ValidationError("Free courses do not require payment.")
        
        # Check if seats are available
        if value.is_full:
            raise serializers.ValidationError("No seats available for this course.")
            
        return value


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a Payment (Order)."""

    class Meta:
        model = Payment
        fields = ["course", "amount", "currency", "payment_method", "metadata"]

    def validate_course(self, value):
        """Additional checks for course before creating an order."""
        if not value.is_published:
            raise serializers.ValidationError("Course is not available for purchase.")
        
        if value.is_full:
            raise serializers.ValidationError("Course is full.")
            
        return value

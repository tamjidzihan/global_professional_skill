from rest_framework import serializers
from .models import Payment, PaymentStatus, PromoCode
from apps.courses.models import Course


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_thumbnail = serializers.ImageField(source="course.thumbnail", read_only=True)
    course_slug = serializers.SlugField(source="course.slug", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_email",
            "course",
            "course_title",
            "course_thumbnail",
            "course_slug",
            "amount",
            "currency",
            "status",
            "transaction_id",
            "sender_number",
            "payment_method",
            "created_at",
            "completed_at",
            "metadata",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
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
    promo_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Payment
        fields = [
            "course",
            "amount",
            "currency",
            "payment_method",
            "transaction_id",
            "sender_number",
            "promo_code",
            "metadata",
        ]

    def validate_course(self, value):
        """Additional checks for course before creating an order."""
        if not value.is_published:
            raise serializers.ValidationError("Course is not available for purchase.")
        
        if value.is_full:
            raise serializers.ValidationError("Course is full.")
            
        return value

    def validate_transaction_id(self, value):
        """Ensure transaction ID is provided for manual payment methods."""
        if not value:
            raise serializers.ValidationError("Transaction ID is required for verification.")
        
        # Check if transaction ID already exists
        if Payment.objects.filter(transaction_id=value).exists():
            raise serializers.ValidationError("This Transaction ID has already been submitted.")
            
        return value


class PromoCodeSerializer(serializers.ModelSerializer):
    """Serializer for PromoCode management."""
    
    courses_detail = serializers.SerializerMethodField()

    class Meta:
        model = PromoCode
        fields = [
            "id",
            "code",
            "discount_percentage",
            "valid_from",
            "valid_until",
            "max_uses",
            "uses_count",
            "is_active",
            "courses",
            "courses_detail",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uses_count", "created_at", "updated_at"]

    def get_courses_detail(self, obj):
        return [{"id": str(c.id), "title": c.title} for c in obj.courses.all()]

    def validate_code(self, value):
        return value.upper().strip()


class PromoCodeValidateSerializer(serializers.Serializer):
    """Serializer for validating promo code at checkout."""
    code = serializers.CharField(required=True)
    course_id = serializers.UUIDField(required=True)


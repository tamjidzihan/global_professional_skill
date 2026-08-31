from decimal import Decimal
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import Payment, PaymentStatus, PromoCode
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PromoCodeSerializer,
    PromoCodeValidateSerializer,
)
from apps.accounts.permissions import IsAdmin, IsInstructorOrAdmin
from apps.enrollments.models import Enrollment


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payments."""

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "course", "user", "payment_method"]
    search_fields = ["transaction_id", "user__email", "course__title"]
    ordering_fields = ["created_at", "amount", "completed_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self): # type: ignore
        """Return appropriate serializer."""
        if self.action == "create":
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self): # type: ignore
        """
        Filter queryset based on user role:
        - Students: Their own payments
        - Admins: All payments
        - Instructors: Payments for their courses
        """
        user = self.request.user
        
        if not user.is_authenticated:
            return Payment.objects.none()

        if user.is_admin_user: # type: ignore
            return Payment.objects.select_related("user", "course").all()
        
        if user.is_instructor: # type: ignore
            return Payment.objects.filter(course__instructor=user).select_related("user", "course")

        return Payment.objects.filter(user=user).select_related("user", "course")

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            # Only students (or anyone authenticated) can create an order
            return [permissions.IsAuthenticated()]
        if self.action in ["update", "partial_update", "destroy"]:
            # Only admin can manually update payment status (for debugging/correction)
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new payment order."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = serializer.validated_data["course"]
        promo_code_str = (
            serializer.validated_data.get("promo_code")
            or request.data.get("promo_code", "")
        ).strip()

        amount_to_charge = serializer.validated_data.get("amount") or course.price
        metadata = serializer.validated_data.get("metadata", {}) or {}

        if promo_code_str:
            try:
                promo = PromoCode.objects.get(code__iexact=promo_code_str)
                is_valid, reason = promo.is_valid_now(course=course)
                if not is_valid:
                    return Response(
                        {"success": False, "error": {"message": reason}},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Calculate discount
                orig_price = course.price
                discount_pct = promo.discount_percentage
                discount_amt = round(orig_price * (discount_pct / Decimal("100.0")), 2)
                amount_to_charge = max(Decimal("0.0"), orig_price - discount_amt)

                metadata.update({
                    "promo_code": promo.code,
                    "original_price": str(orig_price),
                    "discount_percentage": str(discount_pct),
                    "discount_amount": str(discount_amt),
                })

                # Increment promo usage count
                promo.uses_count += 1
                promo.save(update_fields=["uses_count"])
            except PromoCode.DoesNotExist:
                return Response(
                    {"success": False, "error": {"message": "Invalid promo code."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        payment = serializer.save(
            user=request.user,
            amount=amount_to_charge,
            status=PaymentStatus.PENDING,
            metadata=metadata,
        )

        # Trigger Course Purchase Confirmation Email
        try:
            from apps.core.notification_service import dispatch_notification
            dispatch_notification(
                "EMAIL_COURSE_PURCHASE",
                user=request.user,
                context={"course_name": payment.course.title}
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send course purchase email: {str(e)}")

        return Response(
            {
                "success": True,
                "message": "Payment order created successfully.",
                "data": PaymentSerializer(payment).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def approve(self, request, pk=None):
        """Approve a pending payment and enroll the student."""
        payment = self.get_object()
        if payment.status != PaymentStatus.PENDING:
            return Response(
                {"success": False, "error": {"message": "Only pending payments can be approved."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update payment
        payment.status = PaymentStatus.COMPLETED
        payment.completed_at = timezone.now()
        payment.save()
        
        # Create enrollment
        enrollment, created = Enrollment.objects.get_or_create(
            student=payment.user,
            course=payment.course
        )
        
        if created:
            # Update course stats
            course = payment.course
            course.enrollment_count += 1
            course.decrease_available_seats()
            course.save(update_fields=["enrollment_count"])
            
            # Send SMS & Email Notifications for Course Approval
            try:
                from apps.core.notification_service import dispatch_notification
                ctx = {"course_name": course.title, "student_name": payment.user.get_full_name() or payment.user.email}
                dispatch_notification("SMS_COURSE_APPROVAL", user=payment.user, context=ctx)
                dispatch_notification("EMAIL_COURSE_APPROVAL", user=payment.user, context=ctx)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send course approval notifications to {payment.user.email}: {str(e)}")

        return Response({
            "success": True, 
            "message": "Payment approved and student enrolled successfully.",
            "data": PaymentSerializer(payment).data
        })

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    @transaction.atomic
    def reject(self, request, pk=None):
        """Reject a pending payment."""
        payment = self.get_object()
        if payment.status != PaymentStatus.PENDING:
            return Response(
                {"success": False, "error": {"message": "Only pending payments can be rejected."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        feedback = request.data.get("feedback", "Payment verification failed.")
        
        payment.status = PaymentStatus.FAILED
        payment.metadata["rejection_reason"] = feedback
        payment.save()
        
        # Optionally send rejection email
        try:
            subject = f"Payment Verification Failed: {payment.course.title}"
            message = f"Hello {payment.user.get_full_name() or payment.user.email},\n\nWe were unable to verify your payment (TrxID: {payment.transaction_id}) for the course '{payment.course.title}'.\n\nReason: {feedback}\n\nPlease contact our support team if you believe this is an error.\n\nBest regards,\nGlobal Professional Skill Team"
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [payment.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            "success": True, 
            "message": "Payment rejected successfully.",
            "data": PaymentSerializer(payment).data
        })


class PromoCodeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing promo codes."""

    queryset = PromoCode.objects.prefetch_related("courses").all()
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["code"]
    ordering_fields = ["created_at", "discount_percentage", "valid_until"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action == "validate_code":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=["post"], url_path="validate")
    def validate_code(self, request):
        """Validate promo code for a given course."""
        serializer = PromoCodeValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code_str = serializer.validated_data["code"].strip()
        course_id = serializer.validated_data["course_id"]

        from apps.courses.models import Course
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Course not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            promo = PromoCode.objects.get(code__iexact=code_str)
        except PromoCode.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Invalid promo code."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, reason = promo.is_valid_now(course=course)
        if not is_valid:
            return Response(
                {"success": False, "error": {"message": reason}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        orig_price = course.price
        discount_pct = promo.discount_percentage
        discount_amt = round(orig_price * (discount_pct / Decimal("100.0")), 2)
        final_price = max(Decimal("0.0"), orig_price - discount_amt)

        return Response({
            "success": True,
            "message": f"Promo code applied! {discount_pct}% off",
            "data": {
                "id": str(promo.id),
                "code": promo.code,
                "discount_percentage": float(discount_pct),
                "original_price": float(orig_price),
                "discount_amount": float(discount_amt),
                "final_price": float(final_price),
            }
        })


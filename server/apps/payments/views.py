from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import Payment, PaymentStatus
from .serializers import PaymentSerializer, PaymentCreateSerializer
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
        
        # Create payment entry with PENDING status
        payment = serializer.save(
            user=request.user,
            status=PaymentStatus.PENDING,
            # Usually you would initialize with a provider (like Stripe) here
            # For now, we just create the record in our system
        )

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
            
            # Send Email Notification
            try:
                subject = f"Enrollment Confirmed: {course.title}"
                message = f"Hello {payment.user.get_full_name() or payment.user.email},\n\nYour payment (TrxID: {payment.transaction_id}) for the course '{course.title}' has been verified.\n\nYour enrollment is now confirmed. You can access the course content from your student dashboard.\n\nBest regards,\nGlobal Professional Skill Team"
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [payment.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                # Log error but don't fail the approval
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send enrollment email to {payment.user.email}: {str(e)}")

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

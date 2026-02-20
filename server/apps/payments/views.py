from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.utils import timezone

from .models import Payment, PaymentStatus
from .serializers import PaymentSerializer, PaymentCreateSerializer
from apps.accounts.permissions import IsAdmin, IsInstructorOrAdmin


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

    # Note: We will add the complete/webhook logic later as requested.

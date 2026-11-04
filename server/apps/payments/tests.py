from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.courses.models import Course, CourseStatus
from apps.enrollments.models import Enrollment
from .models import Payment, PaymentStatus, PromoCode


class PromoCodeCheckoutTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email="student@example.com",
            password="test-password",
        )
        instructor = User.objects.create_user(
            email="instructor@example.com",
            password="test-password",
            role="INSTRUCTOR",
        )
        self.course = Course.objects.create(
            title="Test course",
            slug="test-course",
            description="Course description",
            short_description="Short description",
            instructor=instructor,
            price=Decimal("1000.00"),
            total_seats=5,
            available_seats=5,
            status=CourseStatus.PUBLISHED,
            learning_outcomes="Learn the topic",
        )
        now = timezone.now()
        self.promo = PromoCode.objects.create(
            code="FREECOURSE",
            discount_percentage=Decimal("100.00"),
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=1),
        )
        self.client.force_authenticate(user=self.student)

    @patch("apps.core.notification_service.dispatch_notification")
    def test_full_discount_completes_payment_and_enrolls_without_bkash_details(
        self, dispatch_notification
    ):
        response = self.client.post(
            "/api/v1/payments/payments/",
            {
                "course": str(self.course.id),
                "amount": "1000.00",
                "currency": "BDT",
                "payment_method": "BKASH",
                "promo_code": self.promo.code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payment = Payment.objects.get(user=self.student, course=self.course)
        self.assertEqual(payment.amount, Decimal("0.00"))
        self.assertEqual(payment.status, PaymentStatus.COMPLETED)
        self.assertEqual(payment.payment_method, "PROMO")
        self.assertIsNone(payment.transaction_id)
        self.assertIsNone(payment.sender_number)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())
        self.course.refresh_from_db()
        self.assertEqual(self.course.available_seats, 4)
        self.assertEqual(PromoCode.objects.get(pk=self.promo.pk).uses_count, 1)
        dispatch_notification.assert_called()

    def test_remaining_balance_requires_bkash_details(self):
        self.promo.discount_percentage = Decimal("50.00")
        self.promo.save(update_fields=["discount_percentage"])

        response = self.client.post(
            "/api/v1/payments/payments/",
            {
                "course": str(self.course.id),
                "amount": "0.00",
                "currency": "BDT",
                "payment_method": "BKASH",
                "promo_code": self.promo.code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Payment.objects.filter(user=self.student, course=self.course).exists())
        self.assertEqual(PromoCode.objects.get(pk=self.promo.pk).uses_count, 0)

    def test_partial_discount_still_uses_bkash_verification(self):
        self.promo.discount_percentage = Decimal("50.00")
        self.promo.save(update_fields=["discount_percentage"])

        response = self.client.post(
            "/api/v1/payments/payments/",
            {
                "course": str(self.course.id),
                "amount": "1.00",
                "currency": "BDT",
                "payment_method": "BKASH",
                "transaction_id": "TEST-TRX-001",
                "sender_number": "01700000000",
                "promo_code": self.promo.code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payment = Payment.objects.get(user=self.student, course=self.course)
        self.assertEqual(payment.amount, Decimal("500.00"))
        self.assertEqual(payment.status, PaymentStatus.PENDING)
        self.assertEqual(payment.transaction_id, "TEST-TRX-001")
        self.assertEqual(payment.sender_number, "01700000000")

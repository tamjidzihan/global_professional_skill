from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, EmailVerificationToken
from apps.core.models import NotificationLog


class RegistrationAndVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_valid_registration_with_phone_org_and_employee_id(self):
        data = {
            "first_name": "Rahim",
            "last_name": "Uddin",
            "email": "rahim@example.com",
            "phone_number": "01712345678",
            "organization_name": "Dhaka Tech Ltd",
            "employee_id": "EMP-001",
            "password": "Password123!@#",
            "password_confirm": "Password123!@#",
        }
        response = self.client.post("/api/v1/accounts/register/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])

        user = User.objects.get(email="rahim@example.com")
        self.assertEqual(user.phone_number, "+8801712345678")
        self.assertEqual(user.organization_name, "Dhaka Tech Ltd")
        self.assertEqual(user.employee_id, "EMP-001")
        self.assertFalse(user.email_verified)
        self.assertFalse(user.phone_verified)

        # Check that verification token exists
        token_obj = EmailVerificationToken.objects.filter(user=user).first()
        self.assertIsNotNone(token_obj)

        # Check that SMS notification log was created
        sms_log = NotificationLog.objects.filter(
            recipient_user=user, channel="SMS"
        ).first()
        self.assertIsNotNone(sms_log)
        self.assertIn(token_obj.token, sms_log.body)

    def test_registration_missing_phone_fails(self):
        data = {
            "first_name": "Karim",
            "last_name": "Chowdhury",
            "email": "karim@example.com",
            "phone_number": "",
            "password": "Password123!@#",
            "password_confirm": "Password123!@#",
        }
        response = self.client.post("/api/v1/accounts/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_invalid_phone_fails(self):
        data = {
            "first_name": "Karim",
            "last_name": "Chowdhury",
            "email": "karim@example.com",
            "phone_number": "12345",
            "password": "Password123!@#",
            "password_confirm": "Password123!@#",
        }
        response = self.client.post("/api/v1/accounts/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data.get("error", {}).get("details", {}) or response.data)

    def test_registration_duplicate_phone_fails(self):
        User.objects.create_user(
            email="existing@example.com",
            password="Password123!@#",
            phone_number="+8801812345678",
        )
        data = {
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@example.com",
            "phone_number": "01812345678",  # Same number in different format
            "password": "Password123!@#",
            "password_confirm": "Password123!@#",
        }
        response = self.client.post("/api/v1/accounts/register/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verification_flow(self):
        user = User.objects.create_user(
            email="testverify@example.com",
            password="Password123!@#",
            phone_number="+8801912345678",
            email_verified=False,
            phone_verified=False,
        )
        from django.utils import timezone
        from datetime import timedelta
        import secrets

        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user, token=token, expires_at=timezone.now() + timedelta(hours=24)
        )

        response = self.client.post("/api/v1/accounts/verify-email/", {"token": token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        user.refresh_from_db()
        self.assertTrue(user.email_verified)
        self.assertTrue(user.phone_verified)

        # Attempt to reuse token
        response2 = self.client.post("/api/v1/accounts/verify-email/", {"token": token})
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

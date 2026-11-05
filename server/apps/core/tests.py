from datetime import timedelta
from io import BytesIO
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase

from .models import SpecialOffer
from .serializers import SpecialOfferSerializer


User = get_user_model()


def create_test_image():
    image = Image.new("RGB", (4, 3), color="blue")
    image_bytes = BytesIO()
    image.save(image_bytes, format="PNG")
    return SimpleUploadedFile(
        "offer.png", image_bytes.getvalue(), content_type="image/png"
    )


class SpecialOfferApiTests(APITestCase):
    def setUp(self):
        media_directory = tempfile.TemporaryDirectory()
        self.addCleanup(media_directory.cleanup)
        media_settings = override_settings(MEDIA_ROOT=media_directory.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)
        self.admin = User.objects.create_user(
            email="offers-admin@example.com", password="test-password", role="ADMIN"
        )
        self.student = User.objects.create_user(
            email="offers-student@example.com", password="test-password", role="STUDENT"
        )
        self.url = reverse("special-offers-list")
        today = timezone.localdate()
        self.first_offer = SpecialOffer.objects.create(
            title="First",
            image="special_offers/first.png",
            target_url="/courses",
            is_published=True,
            is_active=True,
            start_date=today,
            end_date=today,
            display_order=1,
        )
        self.second_offer = SpecialOffer.objects.create(
            title="Second",
            image="special_offers/second.png",
            target_url="https://example.com/offer",
            is_published=True,
            is_active=True,
            display_order=2,
        )
        self.draft_offer = SpecialOffer.objects.create(
            title="Draft",
            image="special_offers/draft.png",
            target_url="/courses",
            display_order=0,
        )
        SpecialOffer.objects.create(
            title="Inactive",
            image="special_offers/inactive.png",
            target_url="/courses",
            is_published=True,
            is_active=False,
        )
        SpecialOffer.objects.create(
            title="Future",
            image="special_offers/future.png",
            target_url="/courses",
            is_published=True,
            start_date=today + timedelta(days=1),
        )
        SpecialOffer.objects.create(
            title="Expired",
            image="special_offers/expired.png",
            target_url="/courses",
            is_published=True,
            end_date=today - timedelta(days=1),
        )

    def test_public_and_admin_default_list_only_eligible_offers_in_order(self):
        for user in (None, self.admin, self.student):
            if user:
                self.client.force_authenticate(user=user)
            else:
                self.client.force_authenticate(user=None)
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                [item["id"] for item in response.data["data"]],
                [str(self.first_offer.id), str(self.second_offer.id)],
            )

    def test_only_admin_can_list_all_offers_or_manage_them(self):
        response = self.client.get(self.url, {"include_all": "true"})
        self.assertEqual(len(response.data["data"]), 2)

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url, {"include_all": "true"})
        self.assertEqual(len(response.data["data"]), 2)
        response = self.client.post(self.url, {}, format="multipart")
        self.assertEqual(response.status_code, 403)

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"include_all": "true"})
        self.assertEqual(len(response.data["data"]), 6)
        response = self.client.post(
            self.url,
            {
                "title": "New offer",
                "target_url": "/courses",
                "image": create_test_image(),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(str(response.data["data"]["created_by"]), str(self.admin.id))

    def test_admin_can_publish_and_deactivate_an_offer(self):
        self.client.force_authenticate(user=self.admin)
        publish_url = reverse(
            "special-offers-publish", kwargs={"pk": self.draft_offer.id}
        )
        response = self.client.post(publish_url)
        self.assertEqual(response.status_code, 200)
        self.draft_offer.refresh_from_db()
        self.assertTrue(self.draft_offer.is_published)

        deactivate_url = reverse(
            "special-offers-deactivate", kwargs={"pk": self.draft_offer.id}
        )
        response = self.client.post(deactivate_url)
        self.assertEqual(response.status_code, 200)
        self.draft_offer.refresh_from_db()
        self.assertFalse(self.draft_offer.is_active)

    def test_invalid_urls_and_date_ranges_are_rejected(self):
        invalid_url_serializer = SpecialOfferSerializer(
            data={
                "title": "Unsafe link",
                "target_url": "javascript:alert(1)",
                "image": create_test_image(),
            }
        )
        self.assertFalse(invalid_url_serializer.is_valid())
        self.assertIn("target_url", invalid_url_serializer.errors)

        invalid_dates_serializer = SpecialOfferSerializer(
            data={
                "title": "Invalid dates",
                "target_url": "/courses",
                "image": create_test_image(),
                "start_date": "2026-05-10",
                "end_date": "2026-05-09",
            }
        )
        self.assertFalse(invalid_dates_serializer.is_valid())
        self.assertIn("end_date", invalid_dates_serializer.errors)

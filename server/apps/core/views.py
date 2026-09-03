from rest_framework import generics, permissions, status, viewsets, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from .models import (
    SiteSettings,
    AlbumPhoto,
    Announcement,
    NewsTickerItem,
    NotificationTemplate,
    NotificationLog,
)
from .serializers import (
    SiteSettingsSerializer,
    AlbumPhotoSerializer,
    AnnouncementSerializer,
    NewsTickerItemSerializer,
    NotificationTemplateSerializer,
    NotificationLogSerializer,
)
from apps.accounts.permissions import IsAdmin


class SiteSettingsView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or Update global site settings.
    GET: Accessible by everyone (needed for checkout).
    PUT/PATCH: Only Admins.
    """

    serializer_class = SiteSettingsSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):  # type: ignore
        return SiteSettings.get_settings()

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "success": True,
                "message": "Settings updated successfully.",
                "data": serializer.data,
            }
        )


class AlbumPhotoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Campus/Event Album Photos.
    Public can view active photos.
    Admins have full CRUD access, batch upload, and reordering.
    """

    queryset = AlbumPhoto.objects.all()
    serializer_class = AlbumPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    pagination_class = None

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Non-admins only see active photos
        if not (self.request.user.is_authenticated and getattr(self.request.user, "role", "") == "ADMIN"):
            queryset = queryset.filter(is_active=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            }
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "Photo added to album successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "Album photo updated successfully.",
                "data": serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {
                "success": True,
                "message": "Photo removed from album successfully.",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="batch-upload")
    def batch_upload(self, request, *args, **kwargs):
        """Upload multiple photo files at once."""
        files = request.FILES.getlist("images") or request.FILES.getlist("image")
        if not files:
            return Response(
                {"success": False, "error": {"message": "No image files provided."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        title_prefix = request.data.get("title_prefix", "").strip()
        caption = request.data.get("caption", "").strip()
        current_max_order = AlbumPhoto.objects.aggregate(max_order=models.Max("order"))["max_order"] or 0

        created_photos = []
        for idx, file_obj in enumerate(files):
            order = current_max_order + idx + 1
            title = f"{title_prefix} {idx + 1}" if title_prefix else file_obj.name.rsplit(".", 1)[0]
            photo = AlbumPhoto.objects.create(
                image=file_obj,
                title=title[:200],
                caption=caption,
                order=order,
                is_active=True,
                created_by=request.user if request.user.is_authenticated else None,
            )
            created_photos.append(photo)

        serializer = self.get_serializer(created_photos, many=True)
        return Response(
            {
                "success": True,
                "message": f"Successfully uploaded {len(created_photos)} photos.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request, *args, **kwargs):
        """Reorder photos in bulk by providing an array of { id, order }."""
        orders = request.data.get("orders", [])
        if not isinstance(orders, list):
            return Response(
                {"success": False, "error": {"message": "Invalid orders data format."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in orders:
            photo_id = item.get("id")
            order = item.get("order")
            if photo_id and order is not None:
                AlbumPhoto.objects.filter(id=photo_id).update(order=order)

        return Response({"success": True, "message": "Photo order updated successfully."})



class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for site-wide announcements.
    Admins have full CRUD access.
    Others can only list/retrieve visible and timely announcements.
    """

    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.role == "ADMIN":
            now = timezone.now()
            # Show visible announcements that haven't ended yet
            queryset = queryset.filter(is_visible=True).filter(
                models.Q(end_date__isnull=True) | models.Q(end_date__gte=now)
            )
        return queryset

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        # Send Email Notification to all active students
        try:
            from apps.accounts.models import User, UserRole
            from apps.core.notification_service import dispatch_notification
            students = User.objects.filter(role=UserRole.STUDENT, is_active=True)
            for student in students:
                dispatch_notification(
                    "EMAIL_ADMIN_ANNOUNCEMENT",
                    user=student,
                    context={"announcement_content": announcement.content}
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to dispatch admin announcement emails: {str(e)}")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "Announcement created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "Announcement updated successfully.",
                "data": serializer.data,
            }
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})


class NewsTickerItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for news ticker items.
    All authenticated users can read visible items. Admins can manage them.
    """

    queryset = NewsTickerItem.objects.all()
    serializer_class = NewsTickerItemSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.role == "ADMIN"):
            queryset = queryset.filter(is_visible=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "News ticker item created successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "News ticker item updated successfully.",
                "data": serializer.data,
            }
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Admin notification template management.
    """
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAdmin]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Admin delivery logs viewing.
    """
    queryset = NotificationLog.objects.select_related("recipient_user").all()
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAdmin]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})


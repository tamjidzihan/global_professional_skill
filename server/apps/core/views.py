from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from .models import SiteSettings, Announcement, NewsTickerItem
from .serializers import SiteSettingsSerializer, AnnouncementSerializer, NewsTickerItemSerializer
from apps.accounts.permissions import IsAdmin


class SiteSettingsView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or Update global site settings.
    GET: Accessible by everyone (needed for checkout).
    PUT/PATCH: Only Admins.
    """

    serializer_class = SiteSettingsSerializer

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
        serializer.save(created_by=self.request.user)

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

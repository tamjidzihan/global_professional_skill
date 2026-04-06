from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import SiteSettings
from .serializers import SiteSettingsSerializer
from apps.accounts.permissions import IsAdmin

class SiteSettingsView(generics.RetrieveUpdateAPIView) :
    """
    Retrieve or Update global site settings.
    GET: Accessible by everyone (needed for checkout).
    PUT/PATCH: Only Admins.
    """
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.get_settings()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "success": True,
            "message": "Settings updated successfully.",
            "data": serializer.data
        })

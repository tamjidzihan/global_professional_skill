from rest_framework import serializers
from .models import SiteSettings, Announcement
from apps.accounts.serializers import UserSerializer

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'bkash_merchant_number', 
            'bkash_qr_code', 
            'updated_at'
        ]

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'is_visible', 
            'start_date', 'end_date', 'created_at', 
            'updated_at', 'created_by', 'created_by_detail'
        ]
        read_only_fields = ['created_by']

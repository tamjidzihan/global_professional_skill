from rest_framework import serializers
from .models import (
    SiteSettings,
    AlbumPhoto,
    Announcement,
    NewsTickerItem,
    NotificationTemplate,
    NotificationLog,
)
from apps.accounts.serializers import UserSerializer

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'bkash_merchant_number', 
            'bkash_qr_code',
            'quiz_pass_percentage',
            'greenweb_sms_token',
            'campus_tour_video',
            'campus_tour_thumbnail',
            'campus_tour_heading',
            'campus_tour_subtext',
            'album_heading',
            'album_subtext',
            'updated_at'
        ]


class AlbumPhotoSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = AlbumPhoto
        fields = [
            'id',
            'title',
            'caption',
            'image',
            'order',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_detail'
        ]
        read_only_fields = ['created_by']


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


class NewsTickerItemSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = NewsTickerItem
        fields = [
            'id', 'text', 'link', 'color', 'is_visible', 'order',
            'start_date', 'end_date', 'created_at', 'updated_at',
            'created_by', 'created_by_detail'
        ]
        read_only_fields = ['created_by']


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'


class NotificationLogSerializer(serializers.ModelSerializer):
    recipient_user_detail = UserSerializer(source='recipient_user', read_only=True)

    class Meta:
        model = NotificationLog
        fields = '__all__'


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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not (
            user
            and user.is_authenticated
            and getattr(user, 'is_admin_user', False)
        ):
            representation.pop('greenweb_sms_token', None)
        return representation


class AlbumPhotoSerializer(serializers.ModelSerializer):
    created_by_detail = serializers.SerializerMethodField()

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

    def get_created_by_detail(self, obj):
        return serialize_public_author(obj.created_by)


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_detail = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'is_visible', 
            'start_date', 'end_date', 'created_at', 
            'updated_at', 'created_by', 'created_by_detail'
        ]
        read_only_fields = ['created_by']

    def get_created_by_detail(self, obj):
        return serialize_public_author(obj.created_by)


class NewsTickerItemSerializer(serializers.ModelSerializer):
    created_by_detail = serializers.SerializerMethodField()

    class Meta:
        model = NewsTickerItem
        fields = [
            'id', 'text', 'link', 'color', 'is_visible', 'order',
            'start_date', 'end_date', 'created_at', 'updated_at',
            'created_by', 'created_by_detail'
        ]
        read_only_fields = ['created_by']

    def get_created_by_detail(self, obj):
        return serialize_public_author(obj.created_by)


def serialize_public_author(user):
    if user is None:
        return None
    full_name = f'{user.first_name} {user.last_name}'.strip()
    return {'full_name': full_name or 'GPI Team'}


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'


class NotificationLogSerializer(serializers.ModelSerializer):
    recipient_user_detail = UserSerializer(source='recipient_user', read_only=True)

    class Meta:
        model = NotificationLog
        fields = '__all__'

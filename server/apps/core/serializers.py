from rest_framework import serializers
from .models import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'bkash_merchant_number', 
            'bkash_qr_code', 
            'updated_at'
        ]

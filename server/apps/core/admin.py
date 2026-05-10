from django.contrib import admin
from .models import SiteSettings, Announcement

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'bkash_merchant_number', 'updated_at']
    
    def has_add_permission(self, request):
        # Prevent adding more than one settings object
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_visible', 'start_date', 'end_date', 'created_at', 'created_by')
    list_filter = ('is_visible', 'created_at', 'created_by')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

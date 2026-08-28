from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SiteSettingsView,
    AnnouncementViewSet,
    NewsTickerItemViewSet,
    NotificationTemplateViewSet,
    NotificationLogViewSet,
)

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'news-ticker', NewsTickerItemViewSet, basename='news-ticker')
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-templates')
router.register(r'notification-logs', NotificationLogViewSet, basename='notification-logs')

urlpatterns = [
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsView, AnnouncementViewSet, NewsTickerItemViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'news-ticker', NewsTickerItemViewSet, basename='news-ticker')

urlpatterns = [
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]

from django.urls import path
from .views import InstructorAnalyticsView, AdminAnalyticsView

urlpatterns = [
    path('instructor/', InstructorAnalyticsView.as_view(), name='instructor-analytics'),
    path('admin/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]

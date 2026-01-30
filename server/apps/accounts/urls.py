"""
URL patterns for accounts app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, EmailVerificationView, UserLoginView,
    UserProfileView, PasswordChangeView, PasswordResetRequestView,
    PasswordResetConfirmView, InstructorRequestViewSet,
    UserManagementViewSet
)

router = DefaultRouter()
router.register(r'instructor-requests', InstructorRequestViewSet, basename='instructor-request')
router.register(r'users', UserManagementViewSet, basename='user-management')

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Management
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Router URLs
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EnrollmentViewSet,
    LessonProgressViewSet,
    CertificateViewSet,
    CourseCertificateConfigViewSet,
)

router = DefaultRouter()
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'progress', LessonProgressViewSet, basename='lesson-progress')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'certificate-configs', CourseCertificateConfigViewSet, basename='course-certificate-config')

urlpatterns = [
    path('', include(router.urls)),
]


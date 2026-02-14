"""
URL patterns for courses app.
"""
from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    CategoryViewSet, CourseViewSet, SectionViewSet,
    LessonViewSet, ReviewViewSet, MyCoursesViewSet
)

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'my-courses', MyCoursesViewSet, basename='my-course')

# Nested routes for course sections
courses_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'sections', SectionViewSet, basename='course-section')
courses_router.register(r'reviews', ReviewViewSet, basename='course-review')

# Nested routes for section lessons
sections_router = routers.NestedDefaultRouter(courses_router, r'sections', lookup='section')
sections_router.register(r'lessons', LessonViewSet, basename='section-lesson')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('', include(sections_router.urls)),
]

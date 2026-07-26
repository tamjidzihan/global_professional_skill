"""
URL patterns for courses app.
"""
from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    CategoryViewSet, CourseViewSet, SectionViewSet,
    LessonViewSet, ReviewViewSet, MyCoursesViewSet,
    QuizViewSet, QuizQuestionViewSet, MyQuizSubmissionsViewSet,
    QuizLookupView, CourseMaterialViewSet
)

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'my-courses', MyCoursesViewSet, basename='my-course')
router.register(r'my-quiz-submissions', MyQuizSubmissionsViewSet, basename='my-quiz-submission')

# Nested routes for course sections
courses_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
courses_router.register(r'sections', SectionViewSet, basename='course-section')
courses_router.register(r'reviews', ReviewViewSet, basename='course-review')
courses_router.register(r'quizzes', QuizViewSet, basename='course-quiz')
courses_router.register(r'materials', CourseMaterialViewSet, basename='course-material')

# Nested routes for quiz questions
quizzes_router = routers.NestedDefaultRouter(courses_router, r'quizzes', lookup='quiz')
quizzes_router.register(r'questions', QuizQuestionViewSet, basename='quiz-question')

# Nested routes for section lessons
sections_router = routers.NestedDefaultRouter(courses_router, r'sections', lookup='section')
sections_router.register(r'lessons', LessonViewSet, basename='section-lesson')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(courses_router.urls)),
    path('', include(quizzes_router.urls)),
    path('', include(sections_router.urls)),
    path('quizzes/<uuid:pk>/', QuizLookupView.as_view(), name='quiz-lookup'),
]


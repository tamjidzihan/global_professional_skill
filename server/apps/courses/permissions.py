"""
Custom permissions for courses app.
"""

from rest_framework import permissions


class IsCourseInstructorOrAdmin(permissions.BasePermission):
    """Permission for course instructor, coordinator, or admin."""

    def has_object_permission(self, request, view, obj):  # type: ignore
        # Admin has full access
        if request.user.is_admin_user:
            return True

        # Helper to check instructor or coordinator on a course
        def is_instructor_or_coordinator(course):
            if course.instructor == request.user:
                return True
            if hasattr(course, "coordinators") and course.coordinators.filter(id=request.user.id).exists():
                return True
            return False

        # For Course objects
        if hasattr(obj, "instructor"):
            return is_instructor_or_coordinator(obj)

        # For Section objects
        if hasattr(obj, "course"):
            return is_instructor_or_coordinator(obj.course)

        # For Lesson objects (through section)
        if hasattr(obj, "section"):
            return is_instructor_or_coordinator(obj.section.course)

        # For QuizQuestion/QuizSubmission objects (through quiz)
        if hasattr(obj, "quiz"):
            return is_instructor_or_coordinator(obj.quiz.course)

        return False


class IsEnrolledOrInstructor(permissions.BasePermission):
    """Permission for enrolled students, instructor, coordinator, or admin."""

    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.is_admin_user:
            return True

        # Get the course
        if hasattr(obj, "course"):
            course = obj.course if hasattr(obj, "course") else obj.section.course
        else:
            course = obj

        # Instructor or Coordinator has access
        if course.instructor == request.user:
            return True
        if hasattr(course, "coordinators") and course.coordinators.filter(id=request.user.id).exists():
            return True

        # Check if preview lesson
        if hasattr(obj, "is_preview") and obj.is_preview:
            return True

        # Check enrollment
        from apps.enrollments.models import Enrollment

        return Enrollment.objects.filter(student=request.user, course=course).exists()

"""
Custom permissions for courses app.
"""

from rest_framework import permissions


class IsCourseInstructorOrAdmin(permissions.BasePermission):
    """Permission for course instructor or admin."""

    def has_object_permission(self, request, view, obj):  # type: ignore
        # Admin has full access
        if request.user.is_admin_user:
            return True

        # For Course objects
        if hasattr(obj, "instructor"):
            return obj.instructor == request.user

        # For Section objects
        if hasattr(obj, "course"):
            return obj.course.instructor == request.user

        # For Lesson objects (through section)
        if hasattr(obj, "section"):
            return obj.section.course.instructor == request.user

        return False


class IsEnrolledOrInstructor(permissions.BasePermission):
    """Permission for enrolled students, instructor, or admin."""

    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.is_admin_user:
            return True

        # Get the course
        if hasattr(obj, "course"):
            course = obj.course if hasattr(obj, "course") else obj.section.course
        else:
            course = obj

        # Instructor has access
        if course.instructor == request.user:
            return True

        # Check if preview lesson
        if hasattr(obj, "is_preview") and obj.is_preview:
            return True

        # Check enrollment
        from enrollments.models import Enrollment

        return Enrollment.objects.filter(student=request.user, course=course).exists()

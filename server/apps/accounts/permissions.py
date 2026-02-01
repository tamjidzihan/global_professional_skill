"""
Custom permissions for role-based access control.
"""

from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Permission check for Student role."""

    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and request.user.is_student
        )


class IsInstructor(permissions.BasePermission):
    """Permission check for Instructor role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_instructor
        )


class IsAdmin(permissions.BasePermission):
    """Permission check for Admin role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_user
        )


class IsStudentOrInstructor(permissions.BasePermission):
    """Permission check for Student or Instructor roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_student or request.user.is_instructor)
        )


class IsInstructorOrAdmin(permissions.BasePermission):
    """Permission check for Instructor or Admin roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_instructor or request.user.is_admin_user)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission check for object owner or Admin."""

    def has_object_permission(self, request, view, obj):  # type: ignore
        # Admin has full access
        if request.user.is_admin_user:
            return True

        # Check if user is the owner
        if hasattr(obj, "user"):
            return obj.user == request.user

        # For User objects
        if hasattr(obj, "email"):
            return obj == request.user

        return False


class IsEmailVerified(permissions.BasePermission):
    """Permission check for email verification."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.email_verified
        )


class ReadOnly(permissions.BasePermission):
    """Permission for read-only access."""

    def has_permission(self, request, view):  # type: ignore
        return request.method in permissions.SAFE_METHODS

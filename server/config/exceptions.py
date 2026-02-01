"""
Custom exception handler for consistent API error responses.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error response format.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'details': response.data
            }
        }
        
        # Log the error
        request = context.get('request')
        if request:
            logger.error(
                f"API Error: {exc} | "
                f"Path: {request.path} | "
                f"Method: {request.method} | "
                f"User: {request.user if request.user.is_authenticated else 'Anonymous'}"
            )
        
        response.data = custom_response_data
    else:
        # Handle unexpected errors
        logger.exception(f"Unhandled exception: {exc}")
        response = Response(
            {
                'success': False,
                'error': {
                    'message': 'An unexpected error occurred.',
                    'details': str(exc) if context['request'].user.is_staff else None
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response


class APIException(Exception):
    """Base exception for API errors."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "An error occurred."
    
    def __init__(self, message=None, status_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class PermissionDenied(APIException):
    """Exception for permission-related errors."""
    status_code = status.HTTP_403_FORBIDDEN
    default_message = "You do not have permission to perform this action."


class NotFound(APIException):
    """Exception for resource not found errors."""
    status_code = status.HTTP_404_NOT_FOUND
    default_message = "Resource not found."


class ValidationError(APIException):
    """Exception for validation errors."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "Validation error occurred."

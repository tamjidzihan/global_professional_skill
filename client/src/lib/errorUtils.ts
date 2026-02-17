/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";


export const extractErrorDetails = (error: any): Record<string, any> | null => {
    if (error.response?.data &&
        error.response.data.success === false &&
        error.response.data.error?.details) {
        return error.response.data.error.details;
    }
    return null;
};



// Types for error responses
export interface ValidationErrorDetail {
    [key: string]: string[];
}

export interface ErrorResponse {
    success: false;
    error?: {
        message: string;
        code?: string;
        details?: ValidationErrorDetail | Record<string, any>;
    };
    errors?: ValidationErrorDetail;
}

export interface ParsedError {
    message: string;
    code: string | null;
    details: Record<string, any> | null;
    statusCode: number | null;
    validationErrors: ValidationErrorDetail | null;
    originalError: any;
}

/**
 * Extract error message from various error formats
 */
export const extractErrorMessage = (error: any): string => {
    // Check if it's our specific ErrorResponse structure
    if (error.response?.data) {
        const data = error.response.data;

        // Handle your specific error format
        if (data.success === false) {
            // Check for non_field_errors in details
            if (data.error?.details?.non_field_errors?.length > 0) {
                return data.error.details.non_field_errors[0];
            }

            // Check for other field errors in details
            if (data.error?.details && typeof data.error.details === 'object') {
                // Look for any array of errors in details
                for (const key in data.error.details) {
                    if (Array.isArray(data.error.details[key]) && data.error.details[key].length > 0) {
                        return data.error.details[key][0];
                    }
                }
            }

            // Check for error message
            if (data.error?.message) {
                return data.error.message;
            }
        }

        // Handle DRF's non_field_errors at root level
        if (data.non_field_errors?.length > 0) {
            return data.non_field_errors[0];
        }

        // Handle other common error structures
        if (data.message) {
            return data.message;
        }

        if (data.detail) {
            return data.detail;
        }

        if (data.error && typeof data.error === 'string') {
            return data.error;
        }
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};
/**
 * Extract validation errors from response
 */
export const extractValidationErrors = (error: any): ValidationErrorDetail | null => {
    if (error.response?.data) {
        const data = error.response.data;

        // Handle your specific error format with details object
        if (data.success === false && data.error?.details) {
            return data.error.details;
        }

        // Check for errors object (field validation errors)
        if (data.errors) {
            return data.errors;
        }

        // Handle DRF field errors format
        const anyData = data as any;
        const fieldErrors: ValidationErrorDetail = {};

        // Check if response has field-specific errors (DRF format)
        for (const key in anyData) {
            if (Array.isArray(anyData[key]) && !['non_field_errors', 'detail', 'message'].includes(key)) {
                fieldErrors[key] = anyData[key];
            }
        }

        return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
    }

    return null;
};

/**
 * Extract error code from response
 */
export const extractErrorCode = (error: any): string | null => {
    if (error.isAxiosError && error.response?.data) {
        const data = error.response.data as ErrorResponse;

        // Check for error code
        if (data.error?.code) {
            return data.error.code;
        }

        // Map HTTP status codes to error codes
        if (error.response.status) {
            const statusCodeMap: Record<number, string> = {
                400: 'BAD_REQUEST',
                401: 'UNAUTHORIZED',
                403: 'FORBIDDEN',
                404: 'NOT_FOUND',
                405: 'METHOD_NOT_ALLOWED',
                409: 'CONFLICT',
                415: 'UNSUPPORTED_MEDIA_TYPE',
                422: 'UNPROCESSABLE_ENTITY',
                429: 'TOO_MANY_REQUESTS',
                500: 'INTERNAL_SERVER_ERROR',
                502: 'BAD_GATEWAY',
                503: 'SERVICE_UNAVAILABLE',
                504: 'GATEWAY_TIMEOUT',
            };

            return statusCodeMap[error.response.status] || `HTTP_${error.response.status}`;
        }
    }

    return null;
};

/**
 * Extract HTTP status code from error
 */
export const extractStatusCode = (error: any): number | null => {
    if (error.isAxiosError && error.response?.status) {
        return error.response.status;
    }
    return null;
};

/**
 * Format field errors for display (e.g., in forms)
 */
export const formatFieldErrors = (errors: ValidationErrorDetail | null): Record<string, string> => {
    const formatted: Record<string, string> = {};

    if (!errors) {
        return formatted;
    }

    Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
            formatted[field] = messages[0]; // Take first error message for the field
        } else if (typeof messages === 'string') {
            formatted[field] = messages;
        }
    });

    return formatted;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
    return error.isAxiosError && !error.response && error.code === 'ERR_NETWORK';
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
    return error.isAxiosError && error.code === 'ECONNABORTED';
};

/**
 * Check if error is a cancellation error
 */
export const isCancellationError = (error: any): boolean => {
    return error.isAxiosError && axios.isCancel(error);
};

/**
 * Get user-friendly error message for common HTTP status codes
 */
export const getHttpStatusMessage = (statusCode: number): string => {
    const messages: Record<number, string> = {
        400: 'Invalid request. Please check your input.',
        401: 'Your session has expired. Please log in again.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        405: 'This action is not allowed.',
        409: 'A conflict occurred. Please try again.',
        415: 'Unsupported media type.',
        422: 'Unable to process the request. Please check your input.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'An internal server error occurred. Please try again later.',
        502: 'Bad gateway. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.',
        504: 'Gateway timeout. Please try again later.',
    };

    return messages[statusCode] || `An error occurred (HTTP ${statusCode})`;
};

/**
 * Main error parser that combines all extractors
 */
export const parseError = (error: any): ParsedError => {
    const message = extractErrorMessage(error);
    const code = extractErrorCode(error);
    const statusCode = extractStatusCode(error);
    const validationErrors = extractValidationErrors(error);

    // Handle network errors
    if (isNetworkError(error)) {
        return {
            message: 'Network error. Please check your internet connection.',
            code: 'NETWORK_ERROR',
            details: null,
            statusCode: null,
            validationErrors: null,
            originalError: error,
        };
    }

    // Handle timeout errors
    if (isTimeoutError(error)) {
        return {
            message: 'Request timeout. Please try again.',
            code: 'TIMEOUT_ERROR',
            details: null,
            statusCode: null,
            validationErrors: null,
            originalError: error,
        };
    }

    // Handle cancellation errors
    if (isCancellationError(error)) {
        return {
            message: 'Request was cancelled.',
            code: 'CANCELLED',
            details: null,
            statusCode: null,
            validationErrors: null,
            originalError: error,
        };
    }

    // Handle HTTP status codes with generic messages if no specific message
    if (statusCode && !validationErrors && message === 'An unexpected error occurred') {
        return {
            message: getHttpStatusMessage(statusCode),
            code: code || `HTTP_${statusCode}`,
            details: null,
            statusCode,
            validationErrors: null,
            originalError: error,
        };
    }

    return {
        message,
        code,
        details: null, // You can implement extractErrorDetails if needed
        statusCode,
        validationErrors,
        originalError: error,
    };
};

/**
 * Create a user-friendly error message for display
 */
export const getDisplayMessage = (error: any): string => {
    const parsed = parseError(error);

    // If there are validation errors, create a summary
    if (parsed.validationErrors) {
        const fieldCount = Object.keys(parsed.validationErrors).length;
        if (fieldCount === 1) {
            return `Please correct the error in the form.`;
        } else if (fieldCount > 1) {
            return `Please correct ${fieldCount} errors in the form.`;
        }
    }

    return parsed.message;
};

/**
 * Specific error message extractors for different error types
 */
export const errorMessages = {
    // Course related errors
    course: {
        duplicateTitle: 'Course with this title already exists.',
        noSections: 'Course must have at least one section before submission.',
        invalidStatus: 'Only DRAFT courses can be submitted for review.',
        notInstructor: 'Only the course instructor can perform this action.',
        reviewInvalid: 'Only PENDING or APPROVED courses can be reviewed.',
    },

    // Category related errors
    category: {
        duplicateName: 'Category with this name already exists.',
    },

    // Review related errors
    review: {
        notEnrolled: 'You must be enrolled in this course to leave a review.',
        alreadyReviewed: 'You have already reviewed this course.',
        notOwner: 'You can only update your own reviews.',
        invalidRating: 'Rating must be between 1 and 5.',
    },

    // Enrollment related errors
    enrollment: {
        courseFull: 'Course is full. No seats available.',
        alreadyEnrolled: 'You are already enrolled in this course.',
        admissionClosed: 'Admission deadline has passed.',
        courseNotPublished: 'Cannot enroll in unpublished courses.',
    },

    // Section/Lesson related errors
    content: {
        duplicateOrder: 'Item with this order already exists.',
    },

    // Auth related errors
    auth: {
        invalidCredentials: 'Invalid email or password.',
        inactiveAccount: 'Your account is inactive. Please verify your email.',
        sessionExpired: 'Your session has expired. Please log in again.',
        noRefreshToken: 'Unable to refresh session. Please log in again.',
    },

    // Permission related errors
    permission: {
        denied: 'You do not have permission to perform this action.',
        notAuthenticated: 'Please log in to continue.',
        adminOnly: 'This action requires administrator privileges.',
        instructorOnly: 'This action requires instructor privileges.',
    },

    // Seat related errors
    seats: {
        noSeatsAvailable: 'No seats available.',
        exceedTotal: 'Available seats cannot exceed total seats.',
        minimumOne: 'Total seats must be at least 1.',
    },

    // Date validation errors
    date: {
        pastDeadline: 'Admission deadline cannot be in the past.',
        pastStartDate: 'Class start date cannot be in the past.',
    },
} as const;
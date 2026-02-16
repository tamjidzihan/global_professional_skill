/* eslint-disable @typescript-eslint/no-explicit-any */

export const extractErrorMessage = (error: any): string => {
    // Check if it's our specific ErrorResponse structure
    if (error.response?.data &&
        error.response.data.success === false &&
        error.response.data.error?.message) {
        return error.response.data.error.message;
    }

    // Handle other common error structures
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }

    if (error.response?.data?.error && typeof error.response.data.error === 'string') {
        return error.response.data.error;
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

export const extractErrorDetails = (error: any): Record<string, any> | null => {
    if (error.response?.data &&
        error.response.data.success === false &&
        error.response.data.error?.details) {
        return error.response.data.error.details;
    }
    return null;
};

export const extractErrorCode = (error: any): string | null => {
    if (error.response?.data &&
        error.response.data.success === false &&
        error.response.data.error?.code) {
        return error.response.data.error.code;
    }
    return null;
};
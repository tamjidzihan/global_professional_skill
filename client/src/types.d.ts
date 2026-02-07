export interface User {
    id: string; // $uuid, readOnly
    email: string; // $email, readOnly
    first_name: string;
    last_name: string;
    full_name?: string; // readOnly, can be derived or provided by backend
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'; // readOnly
    bio?: string; // maxLength: 500
    profile_picture?: string; // $uri, readOnly, x-nullable true
    phone_number?: string; // maxLength: 20
    email_verified: boolean; // readOnly
    is_active?: boolean; // readOnly
    date_joined?: string; // $date-time, readOnly
    last_login?: string | null; // $date-time, readOnly, x-nullable true
}

export interface CreateInstructorRequest {
    reason: string;
    qualifications: string;
    teaching_interests: string
}

export interface InstructorRequest {
    id: string;
    user: string;
    user_email: string;
    user_name: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    qualifications: string;
    teaching_interests: string;
    reviewed_by: string | null;
    reviewed_by_email: string | null;
    review_notes: string;
    created_at: string;
    updated_at: string;
    reviewed_at: string | null;
}

export interface InstructorRequestsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        success: boolean;
        data: InstructorRequest[];
    }
}

export interface InstructorRequestDetailResponse {
    success: boolean;
    data: InstructorRequest;
}
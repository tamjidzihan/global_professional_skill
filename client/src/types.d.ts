export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    email_verified: boolean;
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
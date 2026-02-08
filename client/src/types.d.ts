/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    bio?: string;
    profile_picture?: string;
    phone_number?: string;
    email_verified: boolean;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string | null;
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

// Category Management Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    is_active: boolean;
    course_count: number;
    created_at: string;
}

export interface CategoryListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Category[];
}

export type CategoryDetailResponse = Category;

// Course Management Types

export interface CoursesSummary {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    instructor_name: string;
    category_name: string;
    difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    price: string;
    is_free: boolean;
    thumbnail?: string;
    who_can_join: string;
    duration_hours: number;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
    enrollment_count: number;
    average_rating: string;
    total_reviews: number;
    created_at: string;
    published_at: string | null;
}


export interface CourseListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        success: boolean;
        data: CoursesSummary[];
    };
}


export interface LessonSummary {
    id: string;
    title: string;
    lesson_type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
    video_duration: number;
    is_preview: boolean;
    order: number;
}

export interface Section {
    id: string;
    course: string;
    title: string;
    description?: string;
    order: number;
    lessons: LessonSummary[];
    lesson_count: number;
    created_at: string;
}


export interface CourseDetail {
    id: string;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    instructor: User;
    category: Category;
    difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    price: string;
    is_free: boolean;
    thumbnail?: string;
    preview_video?: string;
    duration_hours: number;
    requirements: string;
    learning_outcomes: string;
    target_audience: string;
    who_can_join: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
    sections: Section[];
    enrollment_count: number;
    average_rating: string;
    total_reviews: number;
    reviews: Review[];
    is_enrolled: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}



export interface CourseDetailResponse {
    success: boolean;
    data: CourseDetail;
}


// Lesson Management Types
export interface Lesson {
    id: string;
    section: string;
    section_id: string;
    title: string;
    description?: string;
    lesson_type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
    video_url?: string;
    video_duration?: number;
    content?: string;
    quiz_data?: any;
    is_preview: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}


// Review Management Types
export interface Review {
    id: string;
    course: string;
    student: string;
    student_name: string;
    student_email: string;
    rating: number;
    review_text?: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}
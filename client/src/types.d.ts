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

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
export type LessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT' | 'RESOURCE';

// export interface CoursesSummary {
//     id: string;
//     title: string;
//     slug: string;
//     short_description: string;
//     instructor_name: string;
//     category_name: string;
//     difficulty_level: DifficultyLevel;
//     price: string;
//     is_free: boolean;
//     thumbnail?: string;
//     who_can_join: string;
//     duration_hours: number;
//     status: CourseStatus;
//     enrollment_count: number;
//     average_rating: string;
//     total_reviews: number;
//     total_classes: number;
//     available_seats: number;
//     total_seats: number;
//     is_admission_open: boolean;
//     is_full: boolean;
//     class_starts: string | null;
//     admission_deadline: string | null;
//     schedule: string;
//     venue: string;
//     created_at: string;
//     published_at: string | null;
// }

export interface CoursesSummary {
    id: string;
    title: string;
    price: string;
    duration_hours: number;
    average_rating?: string;
    enrollment_count?: number;
    thumbnail?: string;
    instructor_name: string;
    difficulty_level: DifficultyLevel;
    status: CourseStatus;
    category_name: string;

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
    lesson_type: LessonType;
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
    difficulty_level: DifficultyLevel;
    price: string;
    is_free: boolean;
    thumbnail?: string;
    preview_video?: string;
    duration_hours: number;
    requirements: string;
    learning_outcomes: string;
    target_audience: string;
    who_can_join: string;
    status: CourseStatus;
    sections: Section[];
    enrollment_count: number;
    average_rating: string;
    total_reviews: number;
    reviews: Review[];
    is_enrolled: boolean;
    total_classes: number;
    available_seats: number;
    total_seats: number;
    class_starts: string | null;
    admission_deadline: string | null;
    schedule: string;
    venue: string;
    is_admission_open: boolean;
    is_full: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

export interface CourseDetailResponse {
    success: boolean;
    data: CourseDetail;
}

// Course Create/Update Types
export interface CourseCreateUpdateData {
    title: string;
    description: string;
    short_description: string;
    category: string;
    difficulty_level: DifficultyLevel;
    price: string | number;
    thumbnail?: File | string | null;
    preview_video?: string;
    duration_hours: number;
    requirements: string;
    learning_outcomes: string;
    target_audience: string;
    who_can_join: string;
    class_starts: string | null;
    admission_deadline: string | null;
    schedule: string;
    venue: string;
    total_seats: number;
    available_seats?: number;
    status?: CourseStatus;
}

// Course Capacity Management
export interface CourseCapacity {
    total_seats: number;
    available_seats: number;
    enrollment_count: number;
    is_full: boolean;
    occupancy_rate: number;
}

// Lesson Management Types
export interface Lesson {
    id: string;
    section: string;
    section_id: string;
    title: string;
    description?: string;
    lesson_type: LessonType;
    video_url?: string;
    video_duration?: number;
    content?: string;
    resources?: string;
    quiz_data?: any;
    is_preview: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface LessonCreateUpdateData {
    section: string;
    title: string;
    lesson_type: LessonType;
    content?: string;
    video_url?: string;
    video_duration?: number;
    resources?: File | string | null;
    is_preview: boolean;
    order: number;
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

export interface ReviewCreateUpdateData {
    course: string;
    rating: number;
    review_text?: string;
}

// Schedule and Venue Types
export interface CourseSchedule {
    class_starts: string | null;
    admission_deadline: string | null;
    schedule: string;
    venue: string;
}

// Filter and Query Types
export interface CourseFilters {
    category?: string;
    difficulty_level?: DifficultyLevel;
    is_free?: boolean;
    status?: CourseStatus;
    venue?: string;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
}

// Dashboard/Statistics Types
export interface CourseStatistics {
    total_enrollments: number;
    average_rating: number;
    total_reviews: number;
    total_classes: number;
    available_seats: number;
    total_seats: number;
    occupancy_percentage: number;
    days_until_deadline?: number;
    days_until_start?: number;
}

// Admin Course Review Types
export interface CourseReviewData {
    status: 'APPROVED' | 'PUBLISHED' | 'REJECTED';
    review_notes: string;
}

// Enrollment Status
export interface EnrollmentStatus {
    is_enrolled: boolean;
    enrollment_date?: string;
    completion_percentage?: number;
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

export interface ErrorResponse {
    success: boolean;
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
}
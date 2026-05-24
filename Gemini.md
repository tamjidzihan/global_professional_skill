# Gemini Project Notes

This file serves as a persistent memory for the Gemini CLI agent, detailing learned aspects of the `global_professional` project. It will be updated incrementally as new information is gathered.

## 1. Project Structure Overview

The project is divided into two main parts: `client` (frontend) and `server` (backend).

### 1.1 `server` Directory (Django Project)

The `server` directory contains a Django project that serves as the backend API.

-   **Base Directory**: `D:\Tamzid\github\global_professional_skill\server`
-   **Dependencies**: Listed in `server/requirements.txt`. Key dependencies include Django, Django Rest Framework, Simple JWT, CORS headers, and Celery (configured for in-memory broker, likely for development).
-   **Configuration**: Main settings are in `server/config/settings.py`.
    -   Uses `python-decouple` and `python-dotenv` for environment variable management.
    -   Custom User Model: `accounts.User`.
    -   Database: Currently SQLite (`db.sqlite3`).
    -   JWT Authentication is configured.
    -   CORS is enabled for `http://localhost:3000`.
    -   API Documentation via Swagger/ReDoc using `drf-yasg`.
-   **URL Routing**: `server/config/urls.py` defines the main URL patterns, including:
    -   `/admin/`: Django admin interface.
    -   `/api/docs/`: Swagger UI.
    -   `/api/redoc/`: ReDoc.
    -   `/api/v1/accounts/`: Endpoints for the `accounts` app.
    -   `/api/v1/courses/`: Endpoints for the `courses` app.
    -   `/api/v1/enrollments/`: Endpoints for the `enrollments` app.
    -   `/api/v1/payments/`: Endpoints for the `payments` app.
    -   `/api/v1/analytics/`: Endpoints for the `analytics` app.
-   **Apps**: The Django project is modularized into core applications located in `server/apps/`:
    -   `accounts`:
        -   **Models**: `User` (custom, email-based, roles: STUDENT, INSTRUCTOR, ADMIN), `EmailVerificationToken`, `InstructorRequest`, `PasswordResetToken`.
        -   **Views**: Registration, Email Verification, Login (JWT), Profile, Password Change/Reset, Instructor Request management, User Management (Admin).
    -   `courses`:
        -   **Models**: `Category`, `Course` (approval workflow: DRAFT, PENDING, APPROVED, PUBLISHED, REJECTED; delivery modes: ONLINE, OFFLINE, BOTH), `Section`, `Lesson` (various types), `Review`.
        -   **Views**: Category management (Admin), Course workflow management, Section/Lesson management, Review management.
    -   `enrollments`:
        -   **Models**: `Enrollment` (student-course, progress tracking), `LessonProgress` (individual lesson tracking), `Certificate` (auto-generated upon completion).
        -   **Views**: Enrollment management, Progress tracking updates.
    -   `payments`:
        -   **Models**: `Payment` (tracks status: PENDING, COMPLETED, FAILED, REFUNDED; stores transaction IDs and sender information).
        -   **Views**: Payment creation and tracking.
    -   `careers`:
        -   **Models**: `Job` (title, description, requirements, job type, salary range), `JobApplication` (user, job, cv file, cover letter, status).
        -   **Views**: Job listing management and application processing.
    -   `analytics`:
        -   Handles data aggregation for dashboards.
    -   `core`:
        -   Handles site settings and announcements.

### 1.2 `client` Directory (React/Vite/TypeScript Frontend)

The `client` directory contains the frontend application built with React, Vite, and TypeScript.

-   **Base Directory**: `D:\Tamzid\github\global_professional_skill\client`
-   **Technologies**: React, Vite, TypeScript, React Router, Tailwind CSS, Lucide React (for icons).
-   **Build & Development**:
    -   `dev`: `vite`
    -   `build`: `tsc -b && vite build`
    -   `lint`: `eslint .`
-   **Routing**: Defined in `client/src/router.tsx`.
    -   Uses a `Layout` component and common structure.
    -   Routes include public (Home, About, Courses, Auth) and protected (Dashboards, Profile, Checkout).
-   **Source Code Structure (`client/src`)**:
    -   `main.tsx`: Entry point.
    -   `index.css`: Global styles.
    -   `router.tsx`: Routing configuration.
    -   `context/`: `AuthContext.tsx` for authentication state.
    -   `hooks/`: Custom hooks for API interaction (`useAuth`, `useCourses`, `useEnrollments`, `usePayments`, etc.).
    -   `lib/`: 
        -   `api.ts`: Axios configuration, interceptors for token refresh, and a centralized `endpoints` object with corresponding API call functions.
        -   `errorUtils.ts`: Utilities for handling API errors.
        -   `utils.ts`: General utility functions.
    -   `main/pages/`:
        -   `AboutPage.tsx`, `CoursesPage.tsx`, `CourseDetailPage.tsx`, `HomePage.tsx`, `CareerPage.tsx`.
        -   Auth: `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `EmailVerificationPage.tsx`.
        -   `dashboard/`: Subdirectories for `admin`, `instructor`, and `student` dashboards.
            -   `AdminDashboard.tsx`, `InstructorDashboard.tsx`, `StudentDashboard.tsx`, `MyProfilePage.tsx`.
        -   Functional: `CheckoutPage.tsx`, `InstructorApplicationPage.tsx`, `CreateCoursePage.tsx`.
    -   `main/components/`: Reusable UI components categorized by feature (e.g., `courses`, `dashboard`, `ui`).

## 2. Key Features and Workflows

-   **User Roles**: Students can browse and enroll; Instructors can create and manage courses; Admins oversee the platform, approve courses, and manage users.
-   **Course Lifecycle**: Created by Instructor -> Submitted for Review -> Approved by Admin -> Published for Students.
-   **Enrollment & Learning**: Students enroll (via payment if applicable), track progress per lesson, and receive a certificate upon 100% completion.
-   **Payment Tracking**: Support for recording payment details, including transaction IDs and sender numbers (likely for manual verification or mobile banking integrations like bKash).
-   **Career Management**: Admin can post job openings; users can apply by uploading CVs.
-   **Announcements**: Admin can post platform-wide announcements.
-   **Site Settings**: Dynamic configuration for platform-wide settings.

## 3. Future Reference Plan

-   **Testing**: Check `server/apps/core/tests.py` for testing patterns.
-   **Deployment**: Refer to `server/DEPLOYMENT.md` and `client/netlify.toml`.
-   **API Integration**: `client/src/lib/api.ts` defines how the frontend communicates with the backend.
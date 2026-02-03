# Gemini Project Notes

This file serves as a persistent memory for the Gemini CLI agent, detailing learned aspects of the `global_professional` project. It will be updated incrementally as new information is gathered.

## 1. Project Structure Overview

The project is divided into two main parts: `client` (frontend) and `server` (backend).

### 1.1 `server` Directory (Django Project)

The `server` directory contains a Django project that serves as the backend API.

-   **Base Directory**: `D:\code_study\Freelance\github\global_professional\server`
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
-   **Apps**: The Django project is modularized into three core applications located in `server/apps/`:
    -   `accounts`:
        -   **Models**: `User` (custom, email-based, with roles STUDENT, INSTRUCTOR, ADMIN), `EmailVerificationToken`, `InstructorRequest`, `PasswordResetToken`.
        -   **Views**: `UserRegistrationView`, `EmailVerificationView`, `UserLoginView` (JWT), `UserProfileView`, `PasswordChangeView`, `PasswordResetRequestView`, `PasswordResetConfirmView`, `InstructorRequestViewSet` (students create, admins review), `UserManagementViewSet` (admin-only user/role management).
    -   `courses`:
        -   **Models**: `Category`, `Course` (title, instructor, price, status, approval workflow), `Section`, `Lesson` (various types), `Review` (updates course average rating).
        -   **Views**: `CategoryViewSet` (admin-only CUD), `CourseViewSet` (permission-based access, approval workflow with `review` and `submit_for_review` actions), `SectionViewSet`, `LessonViewSet` (enrollment/instructor permission), `ReviewViewSet` (authenticated users create/update own reviews).
    -   `enrollments`:
        -   **Models**: `Enrollment` (student-course, progress), `LessonProgress` (individual lesson tracking), `Certificate` (course completion).
        -   **Views**: `EnrollmentViewSet` (enroll/prevent duplicates, increments course enrollment count), `LessonProgressViewSet` (track progress, `mark_complete` action updates course progress).

### 1.2 `client` Directory (React/Vite/TypeScript Frontend)

The `client` directory contains the frontend application built with React, Vite, and TypeScript.

-   **Base Directory**: `D:\code_study\Freelance\github\global_professional\client`
-   **Technologies**: React, Vite, TypeScript, React Router, Tailwind CSS, Lucide React (for icons).
-   **Build & Development**:
    -   `dev`: `vite` (starts development server).
    -   `build`: `tsc -b && vite build` (builds TypeScript and project).
    -   `lint`: `eslint .` (runs ESLint).
-   **Routing**: Defined in `client/src/router.tsx` using `react-router-dom`'s `createBrowserRouter`.
    -   Uses a `Layout` component for common structure.
    -   Routes include: `/`, `/courses`, `/course/:id`, `/about`, `/login`, `/register`.
-   **Source Code Structure (`client/src`)**:
    -   `main.tsx`: Entry point of the application.
    -   `index.css`: Global styles.
    -   `Layout.tsx`: Main layout component.
    -   `router.tsx`: Routing configuration.
    -   `assets/`: Static assets.
    -   `main/`: Contains core application logic, components, and pages.
        -   `main/pages/`:
            -   `AboutPage.tsx`
            -   `CourseDetailPage.tsx`
            -   `CoursesPage.tsx`
            -   `HomePage.tsx`
            -   `LoginPage.tsx`
            -   `RegisterPage.tsx`
        -   `main/components/`: Reusable UI components:
            -   `AboutSection.tsx`
            -   `AuthLayout.tsx`
            -   `Breadcrumb.tsx`
            -   `CourseCard.tsx`
            -   `CourseSection.tsx`
            -   `Footer.tsx`
            -   `Header.tsx`
            -   `HeroSection.tsx`
            -   `PartnersSection.tsx`
            -   `StatsSection.tsx`
-   **Deployment**: `netlify.toml` suggests deployment via Netlify.

## 2. Future Reference Plan

-   **Testing**: Investigate existing test setups (e.g., `pytest` for Django, client-side testing frameworks) or plan for test creation for new features/bug fixes.
-   **Deployment**: Review `server/DEPLOYMENT.md` and `client/netlify.toml` for deployment strategies.
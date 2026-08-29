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
        -   **Models**: `Category`, `Course` (approval workflow: DRAFT, PENDING, APPROVED, PUBLISHED, REJECTED; delivery modes: ONLINE, OFFLINE, BOTH), `Section`, `Lesson` (various types), `Review`, `Quiz` (duration, PIN code, course relations), `QuizQuestion` (MCQ options, correct answer), `QuizSubmission` (attempts, scores, warnings for proctoring), `CourseMaterial` (uploaded files, types, sizes).
        -   **Views**: Category management (Admin), Course workflow management, Section/Lesson management, Review management, Quiz management & submission (`start` and `submit` actions with automated grading), Quiz Lookup (retrieve meta by quiz UUID).
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
-   **Technologies**: React 19, Vite, TypeScript, React Router 7, Tailwind CSS 4, Lucide React (for icons).
-   **Build & Development**:
    -   `dev`: `vite`
    -   `build`: `tsc -b && vite build`
    -   `lint`: `eslint .`
-   **Routing**: Defined in `client/src/router.tsx`.
    -   Uses a `Layout` component and common structure.
    -   Routes include public (Home, About, Courses, Auth, Careers, Announcements) and protected (Dashboards, Profile, Checkout, Take Quiz).
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
        -   Public/Functional Pages: `AboutPage.tsx`, `CoursesPage.tsx`, `CourseDetailPage.tsx`, `HomePage.tsx`, `CareerPage.tsx`, `ContactPage.tsx`, `TakeQuizPage.tsx` (PIN gate, timer, single-question flow, strict tab focus/blur/copy proctoring).
        -   Auth: `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `EmailVerificationPage.tsx`, `VerifyEmailPromptPage.tsx`.
        -   `dashboard/`: Subdirectories for `admin`, `instructor`, and `student` dashboards.
            -   `AdminDashboard.tsx`, `InstructorDashboard.tsx`, `StudentDashboard.tsx`, `MyProfilePage.tsx`, `EnrolledStudentsPage.tsx`.
            -   `admin/`: `AdminCourseDetailPage.tsx`, `AnnouncementManagementPage.tsx`, `CategoryManagementPage.tsx`, `CourseManagementPage.tsx`, `JobApplicationsPage.tsx`, `JobManagementPage.tsx`, `PaymentManagementPage.tsx`, `SiteSettingsPage.tsx`, `UserManagementPage.tsx`.
            -   `instructor/`: `CourseEditDetailPage.tsx`, `CourseMaterialsPage.tsx` (manage course files), `CourseProgressPage.tsx`, `CurriculumPage.tsx`, `InstructorCourseDetailPage.tsx`, `MyCoursesPage.tsx`, `QuizListPage.tsx` (manage course quizzes), `QuizQuestionsPage.tsx` (manage quiz questions), `ReportsPage.tsx`.
            -   `student/`: `CertificatesPage.tsx`, `EnrolledCourseDetailPage.tsx`, `MyEnrollmentsPage.tsx`, `StudentMaterialsPage.tsx` (view/download course files).
    -   `main/components/`: Reusable UI components categorized by feature (e.g., `courses`, `dashboard`, `ui`).

## 2. Key Features and Workflows

-   **User Roles**: Students can browse and enroll; Instructors can create and manage courses; Admins oversee the platform, approve courses, and manage users.
-   **Course Lifecycle**: Created by Instructor -> Submitted for Review -> Approved by Admin -> Published for Students.
-   **Enrollment & Learning**: Students enroll (via payment if applicable), track progress per lesson, download materials, and receive a certificate upon 100% completion.
-   **MCQ Quiz Proctoring**: Instructors can set PIN-protected MCQ quizzes with strict limits and anti-cheat tracking (blur/tab change warnings). Results are automatically graded and reported to both student and instructor.
-   **Payment Tracking**: Support for recording payment details, including transaction IDs and sender numbers (for manual verification of mobile banking integrations like bKash).
-   **Career Management**: Admin can post job openings; users can apply by uploading CVs.
-   **Announcements**: Admin can post platform-wide announcements.
-   **Site Settings**: Dynamic configuration for platform-wide settings.

## 3. Future Reference Plan

-   **Testing**: Check `server/apps/core/tests.py` for testing patterns.
-   **Deployment**: Refer to `server/DEPLOYMENT.md` and `client/netlify.toml`.
-   **API Integration**: `client/src/lib/api.ts` defines how the frontend communicates with the backend.

## 4. Standard Dashboard Design System & Guidelines (User/Instructor/Admin)

All future user dashboard pages, tables, and detail screens must strictly follow the design system established in `EnrolledStudentsPage.tsx` and `StudentQuizSubmissionsPage.tsx`.

### 4.1 Layout & Containers
- **Page Wrapper**: `<div className="py-6 px-4 md:px-6 space-y-5">`
- **Card Tokens**:
  - `card = 'bg-white rounded-xl border border-gray-100 shadow-sm'`
  - `cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'`
- **Typography & Header Structure**:
  - Back Navigation: `<button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /> Back to ...</button>`
  - Main Title: `<h1 className="text-xl font-semibold text-gray-900 tracking-tight">Page Title</h1>`
  - Subtitle: `<p className="text-sm text-gray-400 mt-0.5 truncate">Context · Extra Info</p>`
  - Action Button (Top Right): `<button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shrink-0">`

### 4.2 Quick Stats Cards
- **Grid Layout**: `<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">` (or 3 columns for 3 stats)
- **Item Format**:
  ```tsx
  <div className={`${card} p-4 flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconText}`} />
      </div>
      <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
      </div>
  </div>
  ```

### 4.3 Search & Filter Controls
- **Card Header**: Search input with `relative`, `w-44` to `w-52`, `text-sm bg-gray-50 border border-gray-200 rounded-lg` + status dropdown select with `Filter` icon.
- **Pill Filters**: Horizontal scrollable container with rounded-lg buttons:
  - Active: `bg-gray-900 text-white shadow-sm` (for ALL), `bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm` (COMPLETED), `bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-sm` (IN_PROGRESS), `bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-sm` (DISQUALIFIED).
  - Inactive: `bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100`.

### 4.4 Tables & Rows
- **Headers**: `<th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">`
- **Rows**: `<tr className="group hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer">`
- **Progress Bars**:
  - Container: `<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">`
  - Fill: `<div className="h-full rounded-full transition-all duration-500 bg-emerald-500" style={{ width: '${pct}%' }} />`
- **Status Badges**:
  - Completed: `inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md`
  - In Progress: `inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-md`
  - Disqualified: `inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-md border border-rose-100`
- **Row Actions**:
  - Container: `<div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">`
  - Square Action Buttons: `w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors`
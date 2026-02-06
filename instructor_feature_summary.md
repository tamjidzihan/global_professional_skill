
## Instructor Feature Implementation

### Frontend (`client` project)

#### 1. Pages Created

-   **InstructorApplicationPage.tsx**: Located at `client/src/main/pages/InstructorApplicationPage.tsx`. This page provides a form for authenticated users (specifically `STUDENT` role, enforced by `ProtectedRoute`) to submit an application to become an instructor. It collects `bio` and `experience` details.
-   **AdminInstructorRequestsPage.tsx**: Located at `client/src/main/pages/dashboard/AdminInstructorRequestsPage.tsx`. This page is accessible only by `ADMIN` users (enforced by `ProtectedRoute`). It displays a list of instructor requests, allowing admins to filter by status (PENDING, APPROVED, REJECTED), view request details, and take action (approve or reject).
-   **InstructorProfilePage.tsx**: Located at `client/src/main/pages/InstructorProfilePage.tsx`. This page displays the profile details of a specific instructor, fetched using their user ID from the URL parameter. It currently shows basic user information like name, email, and role.

#### 2. Router Updates (`client/src/router.tsx`)

The following routes were added:

-   `/apply-as-instructor`: Direct route for instructor application, protected for students.
    ```typescript
    { path: '/apply-as-instructor', element: <ProtectedRoute allowedRoles={['STUDENT']}><InstructorApplicationPage /></ProtectedRoute> },
    ```
-   `/instructors/:id`: Route to view an instructor's profile.
    ```typescript
    { path: '/instructors/:id', element: <InstructorProfilePage /> },
    ```
-   `/dashboard/admin/instructor-requests`: Nested route within the admin dashboard for managing instructor requests, protected for admins.
    ```typescript
    // Inside the admin dashboard children array
    { path: 'instructor-requests', element: <AdminInstructorRequestsPage /> },
    ```

#### 3. API Service Updates (`client/src/lib/api.ts`)

The `endpoints` object was extended, and new API functions were added to handle instructor request and user management operations:

-   **New Endpoints**:
    ```typescript
    instructorRequests: {
        // ... existing
        detail: (id: string) => `/accounts/instructor-requests/${id}/`,
    },
    users: {
        detail: (id: string) => `/accounts/users/${id}/`,
        updateRole: (id: string) => `/accounts/users/${id}/update_role/`,
    },
    ```
-   **New API Functions**:
    -   `createInstructorRequest(data: { bio: string; experience: string })`: `POST` request to `/accounts/instructor-requests/` to submit an application.
    -   `getInstructorRequests(status?: string)`: `GET` request to `/accounts/instructor-requests/` to fetch a list of requests, optionally filtered by status.
    -   `getInstructorRequestDetail(id: string)`: `GET` request to `/accounts/instructor-requests/${id}/` to fetch a single instructor request's details.
    -   `reviewInstructorRequest(id: string, data: { status: 'APPROVED' | 'REJECTED'; feedback?: string })`: `POST` request to `/accounts/instructor-requests/${id}/review/` to approve or reject a request.
    -   `updateUserRole(userId: string, role: string)`: `PATCH` request to `/accounts/users/${userId}/update_role/` to change a user's role (used when approving an instructor request).
    -   `getUserDetail(userId: string)`: `GET` request to `/accounts/users/${userId}/` to fetch a user's profile details.

#### 4. API Integration and State Management

-   All new pages leverage `@tanstack/react-query` for efficient data fetching, caching, and mutation management.
-   `react-router-dom`'s `useNavigate` and `useParams` hooks are used for navigation and extracting route parameters.
-   `react-toastify` is used to provide user feedback for successful operations and errors.
-   The `useAuth` hook is utilized for user authentication checks and role-based access control where necessary.

### Backend (`server` project)

The backend API (`server/apps/accounts/views.py`) already provided the necessary endpoints for `InstructorRequestViewSet` (create, list, retrieve, and the custom `review` action) and `UserManagementViewSet` (specifically the `update_role` action), which were utilized by the frontend implementation. No modifications were required in the backend for this task.

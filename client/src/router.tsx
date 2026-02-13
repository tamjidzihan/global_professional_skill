import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./main/layouts/DashboardLayout";
import Layout from "./main/layouts/Layout";
import AboutPage from "./main/pages/AboutPage";
import { CourseDetailPage } from "./main/pages/CourseDetailPage";
import CoursesPage from "./main/pages/CoursesPage";
import { AdminDashboard } from "./main/pages/dashboard/AdminDashboard";
import { InstructorDashboard } from "./main/pages/dashboard/InstructorDashboard";
import { MyProfilePage } from "./main/pages/dashboard/MyProfilePage";
import { StudentDashboard } from "./main/pages/dashboard/StudentDashboard";
import EmailVerificationPage from "./main/pages/EmailVerificationPage";
import ForgotPasswordPage from "./main/pages/ForgotPasswordPage";
import HomePage from "./main/pages/HomePage";
import InstructorApplicationPage from "./main/pages/InstructorApplicationPage";
import { LoginPage } from "./main/pages/LoginPage";
import NotificationsPage from "./main/pages/NotificationsPage";
import PrivacyPage from "./main/pages/PrivacyPage";
import ProfilePage from "./main/pages/ProfilePage";
import { RegisterPage } from "./main/pages/RegisterPage";
import TermsPage from "./main/pages/TermsPage";
import VerifyEmailPromptPage from "./main/pages/VerifyEmailPromptPage";
import ProtectedRoute from "./ProtectedRoute";
import CreateCoursePage from "./main/pages/CreateCoursePage";
import { PublicRoute } from "./PublicRoute";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/courses', element: <CoursesPage /> },
            { path: '/courses/:id', element: <CourseDetailPage /> },
            { path: '/about', element: <AboutPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/terms', element: <TermsPage /> },
            { path: '/privacy', element: <PrivacyPage /> },

            // Auth routes
            {
                path: '/login',
                element:
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
            },
            {
                path: '/register',
                element:
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
            },
            { path: '/verify-email', element: <EmailVerificationPage /> },
            { path: '/verify-email-prompt', element: <VerifyEmailPromptPage /> },

            // Instructors Request
            {
                path: '/apply-as-instructor',
                element:
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <InstructorApplicationPage />
                    </ProtectedRoute>
            },

            // Dashboard routes
            {
                path: '/dashboard',
                element: <DashboardLayout />,
                children: [
                    {
                        path: 'student/*',
                        element: (
                            <ProtectedRoute allowedRoles={['STUDENT']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        )
                    },
                    // Instructor dashboard routes
                    {
                        path: 'instructor',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <InstructorDashboard />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/create-course',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <CreateCoursePage />
                            </ProtectedRoute>
                        )
                    },
                    // Admin dashboard routes
                    {
                        path: 'admin/*',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        )
                    },
                    // User Profile Route
                    {
                        path: 'my-profile',
                        element: (
                            <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                                <MyProfilePage />
                            </ProtectedRoute>
                        )
                    },
                ]
            }
        ]
    }

])
import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./main/layouts/DashboardLayout";
import Layout from "./main/layouts/Layout";
import AboutPage from "./main/pages/AboutPage";
import { CourseDetailPage } from "./main/pages/CourseDetailPage";
import CoursesPage from "./main/pages/CoursesPage";
import { AdminDashboard } from "./main/pages/dashboard/AdminDashboard";
import { InstructorDashboard } from "./main/pages/dashboard/InstructorDashboard";
import { StudentDashboard } from "./main/pages/dashboard/StudentDashboard";
import ForgotPasswordPage from "./main/pages/ForgotPasswordPage";
import HomePage from "./main/pages/HomePage";
import { LoginPage } from "./main/pages/LoginPage";
import NotificationsPage from "./main/pages/NotificationsPage";
import PrivacyPage from "./main/pages/PrivacyPage";
import ProfilePage from "./main/pages/ProfilePage";
import { RegisterPage } from "./main/pages/RegisterPage";
import TermsPage from "./main/pages/TermsPage";
import ProtectedRoute from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import EmailVerificationPage from "./main/pages/EmailVerificationPage";
import VerifyEmailPromptPage from "./main/pages/VerifyEmailPromptPage";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/courses', element: <CoursesPage /> },
            { path: '/course/:id', element: <CourseDetailPage /> },
            { path: '/about', element: <AboutPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/terms', element: <TermsPage /> },
            { path: '/privacy', element: <PrivacyPage /> },
            { path: '/verify-email', element: <EmailVerificationPage /> }, // New route for email verification
            { path: '/verify-email-prompt', element: <VerifyEmailPromptPage /> }, // New route for email verification prompt

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
                        path: 'instructor/*',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <InstructorDashboard />
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
                ]
            }
        ]
    }

])
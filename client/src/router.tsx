import { createBrowserRouter } from "react-router-dom";
import HomePage from "./main/pages/HomePage";
import CoursesPage from "./main/pages/CoursesPage";
import AboutPage from "./main/pages/AboutPage";
import { LoginPage } from "./main/pages/LoginPage";
import { RegisterPage } from "./main/pages/RegisterPage";
import { CourseDetailPage } from "./main/pages/CourseDetailPage";
import NotificationsPage from "./main/pages/NotificationsPage";
import ProfilePage from "./main/pages/ProfilePage";
import ForgotPasswordPage from "./main/pages/ForgotPasswordPage";
import TermsPage from "./main/pages/TermsPage";
import PrivacyPage from "./main/pages/PrivacyPage";
import ProtectedRoute from "./ProtectedRoute";
import { StudentDashboard } from "./main/pages/dashboard/StudentDashboard";
import { InstructorDashboard } from "./main/pages/dashboard/InstructorDashboard";
import { AdminDashboard } from "./main/pages/dashboard/AdminDashboard";
import { DashboardLayout } from "./main/layouts/DashboardLayout";
import Layout from "./main/layouts/Layout";
import { PublicRoute } from "./PublicRoute";


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
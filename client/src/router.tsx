import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./main/layouts/DashboardLayout";
import Layout from "./main/layouts/Layout";
import AboutPage from "./main/pages/AboutPage";
import { CourseDetailPage } from "./main/pages/CourseDetailPage";
import CoursesPage from "./main/pages/CoursesPage";
import CreateCoursePage from "./main/pages/CreateCoursePage";
import { AdminDashboard } from "./main/pages/dashboard/AdminDashboard";
import CourseEditDetailPage from "./main/pages/dashboard/instructor/CourseEditDetailPage";
import { InstructorCourseDetailPage } from "./main/pages/dashboard/instructor/InstructorCourseDetailPage";
import MyCoursesPage from "./main/pages/dashboard/instructor/MyCoursesPage";
import { InstructorDashboard } from "./main/pages/dashboard/InstructorDashboard";
import { MyProfilePage } from "./main/pages/dashboard/MyProfilePage";
import { StudentDashboard } from "./main/pages/dashboard/StudentDashboard";
import EmailVerificationPage from "./main/pages/EmailVerificationPage";
import ForgotPasswordPage from "./main/pages/ForgotPasswordPage";
import ResetPasswordPage from "./main/pages/ResetPasswordPage";
import HomePage from "./main/pages/HomePage";
import InstructorApplicationPage from "./main/pages/InstructorApplicationPage";
import { LoginPage } from "./main/pages/LoginPage";
import NotificationsPage from "./main/pages/NotificationsPage";
import PrivacyPage from "./main/pages/PrivacyPage";
import { RegisterPage } from "./main/pages/RegisterPage";
import TermsPage from "./main/pages/TermsPage";
import ContactPage from "./main/pages/ContactPage";
import VerifyEmailPromptPage from "./main/pages/VerifyEmailPromptPage";
import ProtectedRoute from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import CurriculumPage from "./main/pages/dashboard/instructor/CurriculumPage";
import ErrorPage from "./main/pages/ErrorPage";
import DashboardIndex from "./DashboardIndex";
import { CourseManagementPage } from "./main/pages/dashboard/admin/CourseManagementPage";
import { UserManagementPage } from "./main/pages/dashboard/admin/UserManagementPage";
import { CategoryManagementPage } from "./main/pages/dashboard/admin/CategoryManagementPage";
import PaymentManagementPage from "./main/pages/dashboard/admin/PaymentManagementPage";
import SiteSettingsPage from "./main/pages/dashboard/admin/SiteSettingsPage";
import AdminCourseDetailPage from "./main/pages/dashboard/admin/AdminCourseDetailPage";
import CheckoutPage from "./main/pages/CheckoutPage";
import MyEnrollmentsPage from "./main/pages/dashboard/student/MyEnrollmentsPage";
import EnrolledCourseDetailPage from "./main/pages/dashboard/student/EnrolledCourseDetailPage";
import { CertificatesPage } from "./main/pages/dashboard/student/CertificatesPage";
import { ReportsPage } from "./main/pages/dashboard/instructor/ReportsPage";
import CourseProgressPage from "./main/pages/dashboard/instructor/CourseProgressPage";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/courses', element: <CoursesPage /> },
            { path: '/courses/:id', element: <CourseDetailPage /> },
            { path: '/checkout/:id', element: <ProtectedRoute allowedRoles={['STUDENT']}><CheckoutPage /></ProtectedRoute> },
            { path: '/about', element: <AboutPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/reset-password', element: <ResetPasswordPage /> },
            { path: '/terms', element: <TermsPage /> },
            { path: '/privacy', element: <PrivacyPage /> },
            { path: '/contact', element: <ContactPage /> },

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
                    // Dahboard index route - can show overview or redirect based on role
                    {
                        index: true,
                        element: (
                            <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                                <DashboardIndex />
                            </ProtectedRoute>
                        )
                    },
                    // Student dashboard routes
                    {
                        path: 'student',
                        children: [
                            {
                                index: true,
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'my-courses',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <MyEnrollmentsPage />
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'my-courses/:id',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <EnrolledCourseDetailPage />
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'certificates',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <CertificatesPage />
                                    </ProtectedRoute>
                                )
                            }
                        ]
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
                    {
                        path: 'instructor/my-courses',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <MyCoursesPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/edit-course/:id',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <CourseEditDetailPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:id',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <InstructorCourseDetailPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/curriculum',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <CurriculumPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/reports',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <ReportsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/course-progress',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <CourseProgressPage />
                            </ProtectedRoute>
                        )
                    },
                    // Admin dashboard routes
                    {
                        path: 'admin',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/courses',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <CourseManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/courses/:id',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminCourseDetailPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/users',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/categories',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <CategoryManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/payments',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <PaymentManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/settings',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SiteSettingsPage />
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
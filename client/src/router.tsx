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
import RefundPage from "./main/pages/RefundPage";
import CookiePage from "./main/pages/CookiePage";
import ContactPage from "./main/pages/ContactPage";
import CareerPage from "./main/pages/CareerPage";
import JobDetailPage from "./main/pages/JobDetailPage";
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
import { PromoCodeManagementPage } from "./main/pages/dashboard/admin/PromoCodeManagementPage";
import AdminCourseDetailPage from "./main/pages/dashboard/admin/AdminCourseDetailPage";
import AdminCourseAnnouncementsPage from "./main/pages/dashboard/admin/AdminCourseAnnouncementsPage";
import JobManagementPage from "./main/pages/dashboard/admin/JobManagementPage";
import JobApplicationsPage from "./main/pages/dashboard/admin/JobApplicationsPage";
import CheckoutPage from "./main/pages/CheckoutPage";
import MyEnrollmentsPage from "./main/pages/dashboard/student/MyEnrollmentsPage";
import EnrolledCourseDetailPage from "./main/pages/dashboard/student/EnrolledCourseDetailPage";
import StudentQuizResultsPage from "./main/pages/dashboard/student/StudentQuizResultsPage";
import QuizResultDetailPage from "./main/pages/dashboard/student/QuizResultDetailPage";
import { CertificatesPage } from "./main/pages/dashboard/student/CertificatesPage";
import { ReportsPage } from "./main/pages/dashboard/instructor/ReportsPage";
import CourseProgressPage from "./main/pages/dashboard/instructor/CourseProgressPage";
import EnrolledStudentsPage from "./main/pages/dashboard/EnrolledStudentsPage";


import AnnouncementDetailPage from "./main/pages/dashboard/common/AnnouncementDetailPage";
import AnnouncementListPage from "./main/pages/dashboard/common/AnnouncementListPage";
import AnnouncementManagementPage from "./main/pages/dashboard/admin/AnnouncementManagementPage";
import NewsTickerManagementPage from "./main/pages/dashboard/admin/NewsTickerManagementPage";
import QuizListPage from "./main/pages/dashboard/instructor/QuizListPage";
import QuizSubmissionsListPage from "./main/pages/dashboard/instructor/QuizSubmissionsListPage";
import QuizQuestionsPage from "./main/pages/dashboard/instructor/QuizQuestionsPage";
import TakeQuizPage from "./main/pages/TakeQuizPage";
import CourseMaterialsPage from "./main/pages/dashboard/instructor/CourseMaterialsPage";
import CourseAnnouncementsPage from "./main/pages/dashboard/instructor/CourseAnnouncementsPage";
import StudentMaterialsPage from "./main/pages/dashboard/student/StudentMaterialsPage";
import StudentQuizSubmissionsPage from "./main/pages/dashboard/instructor/StudentQuizSubmissionsPage";
import CourseAnalyticsPage from "./main/pages/dashboard/instructor/CourseAnalyticsPage";

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
            { path: '/terms-and-conditions', element: <TermsPage /> },
            { path: '/privacy', element: <PrivacyPage /> },
            { path: '/privacy-policy', element: <PrivacyPage /> },
            { path: '/refund', element: <RefundPage /> },
            { path: '/refund-policy', element: <RefundPage /> },
            { path: '/cookies', element: <CookiePage /> },
            { path: '/cookie-policy', element: <CookiePage /> },
            { path: '/contact', element: <ContactPage /> },
            { path: '/careers', element: <CareerPage /> },
            { path: '/careers/:id', element: <JobDetailPage /> },
            { path: '/announcements', element: <AnnouncementListPage /> },
            { path: '/announcements/:id', element: <AnnouncementDetailPage /> },
            { path: '/quiz/:quizId/take', element: <ProtectedRoute allowedRoles={['STUDENT']}><TakeQuizPage /></ProtectedRoute> },

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
                                path: 'my-courses/:courseId/materials',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <StudentMaterialsPage />
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'my-courses/:courseId/quizzes',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <StudentQuizResultsPage />
                                    </ProtectedRoute>
                                )
                            },
                            {
                                path: 'my-courses/:courseId/quizzes/:submissionId',
                                element: (
                                    <ProtectedRoute allowedRoles={['STUDENT']}>
                                        <QuizResultDetailPage />
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
                        path: 'instructor/my-courses/:courseId/materials',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <CourseMaterialsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/announcements',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <CourseAnnouncementsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/quizzes',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <QuizListPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/quizzes/:quizId/submissions',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <QuizSubmissionsListPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/quizzes/:quizId/submissions/:submissionId',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <QuizResultDetailPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/quizzes/:quizId/questions',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                                <QuizQuestionsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:id/students',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <EnrolledStudentsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:id/students/:studentId/quizzes',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <StudentQuizSubmissionsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/students/:studentId/quizzes',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <StudentQuizSubmissionsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:id/analytics',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <CourseAnalyticsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/analytics',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <CourseAnalyticsPage />
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
                        path: 'admin/courses/:id/students',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <EnrolledStudentsPage />
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
                        path: 'admin/promo-codes',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <PromoCodeManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/course-announcements',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminCourseAnnouncementsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/announcements',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AnnouncementManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/news-ticker',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <NewsTickerManagementPage />
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
                    {
                        path: 'admin/settings/video',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SiteSettingsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/settings/album',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SiteSettingsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/settings/payment',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SiteSettingsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/settings/notifications',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SiteSettingsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/careers',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <JobManagementPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/careers/:jobId/applications',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <JobApplicationsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/careers/applications',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <JobApplicationsPage />
                            </ProtectedRoute>
                        )
                    },

                    {
                        path: 'announcements',
                        element: (
                            <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                                <AnnouncementListPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'announcements/:id',
                        element: (
                            <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                                <AnnouncementDetailPage />
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
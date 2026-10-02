import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { DashboardLayout } from "./main/layouts/DashboardLayout";
import Layout from "./main/layouts/Layout";
import ProtectedRoute from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import ErrorPage from "./main/pages/ErrorPage";
import DashboardIndex from "./DashboardIndex";

const HomePage = lazy(() => import("./main/pages/HomePage"));
const AboutPage = lazy(() => import("./main/pages/AboutPage"));
const CourseDetailPage = lazy(() => import("./main/pages/CourseDetailPage").then((module) => ({ default: module.CourseDetailPage })));
const CoursesPage = lazy(() => import("./main/pages/CoursesPage"));
const CreateCoursePage = lazy(() => import("./main/pages/CreateCoursePage"));
const CheckoutPage = lazy(() => import("./main/pages/CheckoutPage"));
const EmailVerificationPage = lazy(() => import("./main/pages/EmailVerificationPage"));
const ForgotPasswordPage = lazy(() => import("./main/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./main/pages/ResetPasswordPage"));
const InstructorApplicationPage = lazy(() => import("./main/pages/InstructorApplicationPage"));
const LoginPage = lazy(() => import("./main/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const NotificationsPage = lazy(() => import("./main/pages/NotificationsPage"));
const PrivacyPage = lazy(() => import("./main/pages/PrivacyPage"));
const RegisterPage = lazy(() => import("./main/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const TermsPage = lazy(() => import("./main/pages/TermsPage"));
const RefundPage = lazy(() => import("./main/pages/RefundPage"));
const CookiePage = lazy(() => import("./main/pages/CookiePage"));
const ContactPage = lazy(() => import("./main/pages/ContactPage"));
const CareerPage = lazy(() => import("./main/pages/CareerPage"));
const JobDetailPage = lazy(() => import("./main/pages/JobDetailPage"));
const VerifyEmailPromptPage = lazy(() => import("./main/pages/VerifyEmailPromptPage"));
const TakeQuizPage = lazy(() => import("./main/pages/TakeQuizPage"));
const CertificateVerificationPage = lazy(() => import("./main/pages/CertificateVerificationPage"));
const CourseEditDetailPage = lazy(() => import("./main/pages/dashboard/instructor/CourseEditDetailPage"));
const InstructorCourseDetailPage = lazy(() => import("./main/pages/dashboard/instructor/InstructorCourseDetailPage").then((module) => ({ default: module.InstructorCourseDetailPage })));
const MyCoursesPage = lazy(() => import("./main/pages/dashboard/instructor/MyCoursesPage"));
const InstructorDashboard = lazy(() => import("./main/pages/dashboard/InstructorDashboard").then((module) => ({ default: module.InstructorDashboard })));
const MyProfilePage = lazy(() => import("./main/pages/dashboard/MyProfilePage").then((module) => ({ default: module.MyProfilePage })));
const StudentDashboard = lazy(() => import("./main/pages/dashboard/StudentDashboard").then((module) => ({ default: module.StudentDashboard })));
const CurriculumPage = lazy(() => import("./main/pages/dashboard/instructor/CurriculumPage"));
const CourseMaterialsPage = lazy(() => import("./main/pages/dashboard/instructor/CourseMaterialsPage"));
const CourseAnnouncementsPage = lazy(() => import("./main/pages/dashboard/instructor/CourseAnnouncementsPage"));
const QuizListPage = lazy(() => import("./main/pages/dashboard/instructor/QuizListPage"));
const QuizSubmissionsListPage = lazy(() => import("./main/pages/dashboard/instructor/QuizSubmissionsListPage"));
const QuizQuestionsPage = lazy(() => import("./main/pages/dashboard/instructor/QuizQuestionsPage"));
const StudentQuizSubmissionsPage = lazy(() => import("./main/pages/dashboard/instructor/StudentQuizSubmissionsPage"));
const CourseAnalyticsPage = lazy(() => import("./main/pages/dashboard/instructor/CourseAnalyticsPage"));
const ReportsPage = lazy(() => import("./main/pages/dashboard/instructor/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const CourseProgressPage = lazy(() => import("./main/pages/dashboard/instructor/CourseProgressPage"));
const CourseManagementPage = lazy(() => import("./main/pages/dashboard/admin/CourseManagementPage").then((module) => ({ default: module.CourseManagementPage })));
const UserManagementPage = lazy(() => import("./main/pages/dashboard/admin/UserManagementPage").then((module) => ({ default: module.UserManagementPage })));
const AdminUserDetailPage = lazy(() => import("./main/pages/dashboard/admin/AdminUserDetailPage"));
const CategoryManagementPage = lazy(() => import("./main/pages/dashboard/admin/CategoryManagementPage").then((module) => ({ default: module.CategoryManagementPage })));
const PaymentManagementPage = lazy(() => import("./main/pages/dashboard/admin/PaymentManagementPage"));
const SiteSettingsPage = lazy(() => import("./main/pages/dashboard/admin/SiteSettingsPage"));
const PromoCodeManagementPage = lazy(() => import("./main/pages/dashboard/admin/PromoCodeManagementPage").then((module) => ({ default: module.PromoCodeManagementPage })));
const AdminCourseDetailPage = lazy(() => import("./main/pages/dashboard/admin/AdminCourseDetailPage"));
const AdminCourseCertificatePage = lazy(() => import("./main/pages/dashboard/admin/AdminCourseCertificatePage").then((module) => ({ default: module.AdminCourseCertificatePage })));
const CourseCoordinatorsPage = lazy(() => import("./main/pages/dashboard/CourseCoordinatorsPage").then((module) => ({ default: module.CourseCoordinatorsPage })));
const AdminCourseAnnouncementsPage = lazy(() => import("./main/pages/dashboard/admin/AdminCourseAnnouncementsPage"));
const JobManagementPage = lazy(() => import("./main/pages/dashboard/admin/JobManagementPage"));
const JobApplicationsPage = lazy(() => import("./main/pages/dashboard/admin/JobApplicationsPage"));
const MyEnrollmentsPage = lazy(() => import("./main/pages/dashboard/student/MyEnrollmentsPage"));
const EnrolledCourseDetailPage = lazy(() => import("./main/pages/dashboard/student/EnrolledCourseDetailPage"));
const StudentQuizResultsPage = lazy(() => import("./main/pages/dashboard/student/StudentQuizResultsPage"));
const QuizResultDetailPage = lazy(() => import("./main/pages/dashboard/student/QuizResultDetailPage"));
const CertificatesPage = lazy(() => import("./main/pages/dashboard/student/CertificatesPage").then((module) => ({ default: module.CertificatesPage })));
const EnrolledStudentsPage = lazy(() => import("./main/pages/dashboard/EnrolledStudentsPage"));
const AnnouncementDetailPage = lazy(() => import("./main/pages/dashboard/common/AnnouncementDetailPage"));
const AnnouncementListPage = lazy(() => import("./main/pages/dashboard/common/AnnouncementListPage"));
const AnnouncementManagementPage = lazy(() => import("./main/pages/dashboard/admin/AnnouncementManagementPage"));
const NewsTickerManagementPage = lazy(() => import("./main/pages/dashboard/admin/NewsTickerManagementPage"));
const AdminDashboard = lazy(() => import("./main/pages/dashboard/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const StudentMaterialsPage = lazy(() => import("./main/pages/dashboard/student/StudentMaterialsPage"));

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
            { path: '/certificate-verify', element: <CertificateVerificationPage /> },
            { path: '/certificate-verify/:certificateNumber', element: <CertificateVerificationPage /> },
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
                        path: 'instructor/my-courses/:id/coordinators',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <CourseCoordinatorsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'instructor/my-courses/:courseId/coordinators',
                        element: (
                            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                                <CourseCoordinatorsPage />
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
                        path: 'admin/courses/:id/coordinators',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <CourseCoordinatorsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/courses/:courseId/coordinators',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <CourseCoordinatorsPage />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'admin/courses/:courseId/certificate',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminCourseCertificatePage />
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
                        path: 'admin/users/:userId',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminUserDetailPage />
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
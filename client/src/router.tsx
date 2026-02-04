import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
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
import { DashboardLayout } from "./DashboardLayout";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/courses', element: <CoursesPage /> },
            { path: '/course/:id', element: <CourseDetailPage /> },
            { path: '/about', element: <AboutPage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/dashboard/:role', element: <DashboardLayout /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/terms', element: <TermsPage /> },
            { path: '/privacy', element: <PrivacyPage /> },
        ]
    }
])
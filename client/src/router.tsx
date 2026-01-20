import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import HomePage from "./main/pages/HomePage";
import CoursesPage from "./main/pages/CoursesPage";
import AboutPage from "./main/pages/AboutPage";
import { LoginPage } from "./main/pages/LoginPage";
import { RegisterPage } from "./main/pages/RegisterPage";
import { CourseDetailPage } from "./main/pages/CourseDetailPage";


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
        ]
    }
])
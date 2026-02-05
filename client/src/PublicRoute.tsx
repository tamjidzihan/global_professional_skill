import { Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0066CC]"></div>
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated && user) {
        const roleRedirects: Record<string, string> = {
            STUDENT: '/dashboard/student',
            INSTRUCTOR: '/dashboard/instructor',
            ADMIN: '/dashboard/admin'
        };
        const redirectTo = roleRedirects[user.role] || '/';
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
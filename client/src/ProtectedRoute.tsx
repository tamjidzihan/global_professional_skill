import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { isAuthenticated, user, isLoading } = useAuthContext();

    // Show loading spinner or blank page while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066CC]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard or home if role doesn't match
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
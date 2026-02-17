// main/pages/dashboard/DashboardIndex.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export default function DashboardIndex() {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from your auth context

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            navigate('/dashboard/student');
        } else if (user?.role === 'INSTRUCTOR') {
            navigate('/dashboard/instructor');
        } else if (user?.role === 'ADMIN') {
            navigate('/dashboard/admin');
        } else {
            navigate('/'); // Fallback to home if no role
        }
    }, [user, navigate]);

    // Optional: Show loading state while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
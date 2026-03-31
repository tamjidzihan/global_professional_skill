import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, Navigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { useAuth } from '../../hooks/useAuth'

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, loading } = useAuth()

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Get dashboard title based on user role
    const getDashboardTitle = () => {
        switch (user.role) {
            case 'ADMIN':
                return 'Admin Dashboard'
            case 'INSTRUCTOR':
                return 'Instructor Dashboard'
            case 'STUDENT':
                return 'Student Dashboard'
            default:
                return 'Dashboard'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-[#0066CC]">
                        {getDashboardTitle()}
                    </span>
                    <div className="w-8" aria-hidden="true" /> {/* Spacer for alignment */}
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
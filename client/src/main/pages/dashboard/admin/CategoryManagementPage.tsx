import type { JSX } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryTable } from '../../../components/dashboard/admin/CategoryTable';
import SEO from '../../../components/SEO';

export function CategoryManagementPage(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="py-6 px-4 md:px-6">
            <SEO title="Category Management" noindex={true} />
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </button>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Category Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">Create, update and manage course categories.</p>
            </div>
            <CategoryTable />
        </div>
    );
}

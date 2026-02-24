/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { Filter, X, ChevronRight, RotateCcw, BookOpen } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { Category } from '../../../types';

interface MobileFilterDrawerProps {
    showFilters: boolean;
    isClosing: boolean;
    categories: Category[];
    categoryLoading: boolean;
    categoryError: string | null;
    urlCategoryId: string | null;
    urlSearchQuery: string;
    activeCategoryName: string;
    onClose: () => void;
    onClearAll: () => void;
    onFetchCategories: () => void;
}

const MobileFilterDrawer = ({
    showFilters,
    isClosing,
    categories,
    categoryLoading,
    categoryError,
    urlCategoryId,
    urlSearchQuery,
    activeCategoryName,
    onClose,
    onClearAll,
    onFetchCategories
}: MobileFilterDrawerProps) => {

    if (!showFilters && !isClosing) return null;

    return (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop - Matches Header Backdrop */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${showFilters && !isClosing ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            {/* Sidebar - Matches Header Sidebar logic */}
            <div
                className={`absolute top-0 right-0 h-full w-72 md:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${showFilters && !isClosing ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header - Matches Mobile Menu Header Styling */}
                <div className="bg-linear-to-r from-[#0066CC] to-blue-600 text-white p-5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-white/90" />
                        <span className="font-bold text-lg">Filter Courses</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                        aria-label="Close filters"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable area */}
                <nav className="flex-1 overflow-y-auto py-4 overscroll-contain">
                    <div className="px-6 mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Browse Categories
                        </h3>

                        {categoryLoading && categories.length === 0 && (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        )}

                        {categoryError && (
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-red-600 mb-2">{categoryError}</p>
                                <button onClick={onFetchCategories} className="text-xs font-bold text-[#0066CC] underline">Retry</button>
                            </div>
                        )}

                        {!categoryLoading && !categoryError && (
                            <div className="space-y-1">
                                <MobileFilterLink
                                    to="/courses"
                                    label="All Courses"
                                    isActive={!urlCategoryId && !urlSearchQuery}
                                    onClose={onClose}
                                />
                                {categories.map((category) => (
                                    <MobileFilterLink
                                        key={category.id}
                                        to={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}`}
                                        label={category.name}
                                        isActive={urlCategoryId === category.id.toString()}
                                        onClose={onClose}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Filters Section */}
                    {(urlCategoryId || urlSearchQuery) && (
                        <div className="px-6 pt-6 border-t border-gray-100">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Active Filters</h4>
                            <div className="space-y-2">
                                {urlCategoryId && (
                                    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                        <span className="text-xs text-gray-600">Category</span>
                                        <span className="text-xs font-bold text-[#0066CC]">{activeCategoryName}</span>
                                    </div>
                                )}
                                {urlSearchQuery && (
                                    <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                        <span className="text-xs text-gray-600">Search</span>
                                        <span className="text-xs font-bold text-green-700">"{urlSearchQuery}"</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer - Matches Header Button Style */}
                <div className="border-t border-gray-200 p-5 bg-gray-50/50 shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClearAll}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs hover:bg-gray-100 transition-all active:scale-95"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-[#76C043]" />
                            Reset
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-3 bg-linear-to-r from-[#0066CC] to-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const MobileFilterLink = ({ to, label, isActive, onClose }: any) => (
    <Link
        to={to}
        onClick={onClose}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 
            ${isActive
                ? 'bg-blue-50 text-[#0066CC] font-bold border-l-4 border-[#0066CC]'
                : 'text-gray-700 hover:bg-gray-50'}`}
    >
        <div className="flex items-center gap-3">
            <BookOpen className={`w-4 h-4 ${isActive ? 'text-[#76C043]' : 'text-gray-300'}`} />
            <span>{label}</span>
        </div>
        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#0066CC]' : 'text-gray-300'}`} />
    </Link>
)

export default MobileFilterDrawer;
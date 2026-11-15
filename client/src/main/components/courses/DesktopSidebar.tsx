/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../ui/LoadingSpinner";
import type { Category, DeliveryMode } from '../../../types';

interface DesktopSidebarProps {
    categories: Category[];
    categoryLoading: boolean;
    categoryError: string | null;
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
    activeCategoryName: string;
    pagination: any;
    onDeliveryModeChange: (mode: DeliveryMode | '') => void;
    onFetchCategories: () => void;
    onClearAll: () => void;
}

const DesktopSidebar = ({
    categories,
    categoryLoading,
    categoryError,
    urlCategoryId,
    urlSearchQuery,
    urlDeliveryMode,
    activeCategoryName,
    pagination,
    onDeliveryModeChange,
    onFetchCategories,
    onClearAll
}: DesktopSidebarProps) => {
    return (
        <div className="hidden lg:block w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sticky top-4 transition-all hover:shadow-md">
                <DeliveryModeSection
                    selectedMode={urlDeliveryMode}
                    onChange={onDeliveryModeChange}
                />
                <CategoriesSection
                    categories={categories}
                    categoryLoading={categoryLoading}
                    categoryError={categoryError}
                    urlCategoryId={urlCategoryId}
                    urlSearchQuery={urlSearchQuery}
                    urlDeliveryMode={urlDeliveryMode}
                    onFetchCategories={onFetchCategories}
                />
                <QuickStats
                    pagination={pagination}
                    categories={categories}
                    urlCategoryId={urlCategoryId}
                    urlSearchQuery={urlSearchQuery}
                    urlDeliveryMode={urlDeliveryMode}
                    activeCategoryName={activeCategoryName}
                    onClearAll={onClearAll}
                />
            </div>
        </div>
    )
}

interface DeliveryModeSectionProps {
    selectedMode: DeliveryMode | null;
    onChange: (mode: DeliveryMode | '') => void;
}

const DeliveryModeSection = ({ selectedMode, onChange }: DeliveryModeSectionProps) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
            <div className="w-1 h-5 bg-[#0066CC] rounded-full mr-3"></div>
            <span>Course Mode</span>
        </h3>
        <select
            value={selectedMode ?? ''}
            onChange={event => onChange(event.target.value as DeliveryMode | '')}
            aria-label="Filter courses by mode"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition hover:border-gray-300 focus:border-[#0066CC] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/15"
        >
            <option value="">All modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="BOTH">Online &amp; Offline</option>
        </select>
    </div>
);

interface CategoriesSectionProps {
    categories: any[];
    categoryLoading: boolean;
    categoryError: string | null;
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
    onFetchCategories: () => void;
}

const CategoriesSection = ({
    categories,
    categoryLoading,
    categoryError,
    urlCategoryId,
    urlSearchQuery,
    urlDeliveryMode,
    onFetchCategories
}: CategoriesSectionProps) => (
    <div className="mb-8 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
            <div className="w-1 h-5 bg-[#0066CC] rounded-full mr-3"></div>
            <span>Categories</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                {categories.length}
            </span>
        </h3>

        {categoryLoading && categories.length === 0 && (
            <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                    <LoadingSpinner />
                    <p className="text-xs text-gray-500 mt-2">Loading categories...</p>
                </div>
            </div>
        )}

        {categoryError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-red-800 mb-1">Failed to load categories</p>
                <p className="text-xs text-red-600">{categoryError}</p>
                <button
                    onClick={onFetchCategories}
                    className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline underline-offset-2"
                >
                    Try again
                </button>
            </div>
        )}

        {!categoryLoading && !categoryError && (
            <div className="space-y-1">
                <AllCoursesLink
                    urlCategoryId={urlCategoryId}
                    urlSearchQuery={urlSearchQuery}
                    urlDeliveryMode={urlDeliveryMode}
                />
                {categories.map((category) => (
                    <CategoryLink
                        key={category.id}
                        category={category}
                        urlCategoryId={urlCategoryId}
                        urlSearchQuery={urlSearchQuery}
                        urlDeliveryMode={urlDeliveryMode}
                    />
                ))}
            </div>
        )}
    </div>
)

interface AllCoursesLinkProps {
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
}

const AllCoursesLink = ({ urlCategoryId, urlSearchQuery, urlDeliveryMode }: AllCoursesLinkProps) => {
    const navigate = useNavigate();
    const isActive = !urlCategoryId && !urlSearchQuery && !urlDeliveryMode;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // Build URL without page parameter (resets to page 1)
        const params = new URLSearchParams();
        if (urlSearchQuery) {
            params.set('search', urlSearchQuery);
        }
        if (urlDeliveryMode) {
            params.set('delivery_mode', urlDeliveryMode);
        }
        // Don't include page parameter - this resets to page 1
        navigate(`/courses${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <a
            href="/courses"
            onClick={handleClick}
            className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg 
                text-sm transition-all duration-200 ease-in-out cursor-pointer ${isActive
                    ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#0066CC] border border-transparent hover:border-gray-200'
                }`}
        >
            <span className="flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-2.5 transition-all ${isActive
                    ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                    : 'bg-gray-300 group-hover:bg-[#0066CC]'
                    }`}></span>
                All Courses
            </span>
            {isActive && (
                <span className="text-xs bg-[#0066CC]/10 text-[#0066CC] px-2 py-0.5 rounded-full">
                    Active
                </span>
            )}
        </a>
    )
}

interface CategoryLinkProps {
    category: any;
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
}

const CategoryLink = ({ category, urlCategoryId, urlSearchQuery, urlDeliveryMode }: CategoryLinkProps) => {
    const navigate = useNavigate();
    const isActive = urlCategoryId === category.id.toString();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // Build URL with category and search params, but WITHOUT page parameter
        const params = new URLSearchParams();
        params.set('category', category.id.toString());

        if (urlSearchQuery) {
            params.set('search', urlSearchQuery);
        }
        if (urlDeliveryMode) {
            params.set('delivery_mode', urlDeliveryMode);
        }

        // Don't include page parameter - this resets to page 1
        navigate(`/courses?${params.toString()}`);
    };

    return (
        <a
            href={`/courses?category=${category.id}${urlSearchQuery ? `&search=${encodeURIComponent(urlSearchQuery)}` : ''}${urlDeliveryMode ? `&delivery_mode=${urlDeliveryMode}` : ''}`}
            onClick={handleClick}
            className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg 
                text-sm transition-all duration-200 ease-in-out cursor-pointer ${isActive
                    ? 'bg-linear-to-r from-[#0066CC]/10 to-[#0066CC]/5 text-[#0066CC] font-medium border border-[#0066CC]/20'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#0066CC] border border-transparent hover:border-gray-200'
                }`}
        >
            <span className="flex items-center truncate pr-2">
                <span className={`w-1.5 h-1.5 rounded-full mr-2.5 transition-all shrink-0 ${isActive
                    ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/20'
                    : 'bg-gray-300 group-hover:bg-[#0066CC]'
                    }`}></span>
                <span className="truncate">{category.name}</span>
            </span>
            {isActive && (
                <span className="text-xs bg-[#0066CC]/10 text-[#0066CC] px-2 py-0.5 rounded-full shrink-0 ml-2">
                    Active
                </span>
            )}
        </a>
    )
}

interface QuickStatsProps {
    pagination: any;
    categories: any[];
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
    activeCategoryName: string;
    onClearAll: () => void;
}

const QuickStats = ({
    pagination,
    categories,
    urlCategoryId,
    urlSearchQuery,
    urlDeliveryMode,
    activeCategoryName,
    onClearAll
}: QuickStatsProps) => (
    <div className="pt-6 border-t border-gray-200/60">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
            Quick Stats
        </h4>
        <div className="space-y-2.5">
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Courses</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900 leading-none">
                        {pagination.count || 0}
                    </span>
                    <span className="text-xs text-gray-500">courses</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Categories</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900 leading-none">
                        {categories.length}
                    </span>
                    <span className="text-xs text-gray-500">available</span>
                </div>
            </div>

            {(urlCategoryId || urlSearchQuery || urlDeliveryMode) && (
                <ActiveFiltersSummary
                    urlCategoryId={urlCategoryId}
                    urlSearchQuery={urlSearchQuery}
                    urlDeliveryMode={urlDeliveryMode}
                    activeCategoryName={activeCategoryName}
                    onClearAll={onClearAll}
                />
            )}
        </div>
    </div>
)

interface ActiveFiltersSummaryProps {
    urlCategoryId: string | null;
    urlSearchQuery: string;
    urlDeliveryMode: DeliveryMode | null;
    activeCategoryName: string;
    onClearAll: () => void;
}

const ActiveFiltersSummary = ({
    urlCategoryId,
    urlSearchQuery,
    urlDeliveryMode,
    activeCategoryName,
    onClearAll
}: ActiveFiltersSummaryProps) => (
    <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Active Filters</span>
            <button
                onClick={onClearAll}
                className="text-xs font-medium text-[#0066CC] hover:text-[#004c99] transition-colors"
            >
                Clear all
            </button>
        </div>
        <div className="mt-2 space-y-1.5">
            {urlCategoryId && (
                <div className="flex items-center justify-between bg-blue-50/50 px-2 py-1.5 rounded-md">
                    <span className="text-xs text-gray-700">Category</span>
                    <span className="text-xs font-medium text-[#0066CC]">{activeCategoryName}</span>
                </div>
            )}
            {urlSearchQuery && (
                <div className="flex items-center justify-between bg-green-50/50 px-2 py-1.5 rounded-md">
                    <span className="text-xs text-gray-700">Search</span>
                    <span className="text-xs font-medium text-green-700">"{urlSearchQuery}"</span>
                </div>
            )}
            {urlDeliveryMode && (
                <div className="flex items-center justify-between bg-violet-50/50 px-2 py-1.5 rounded-md">
                    <span className="text-xs text-gray-700">Course mode</span>
                    <span className="text-xs font-medium text-violet-700">
                        {urlDeliveryMode === 'BOTH' ? 'Online & Offline' : urlDeliveryMode}
                    </span>
                </div>
            )}
        </div>
    </div>
)

export default DesktopSidebar;
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import Breadcrumb from "../components/Breadcrumb"
import { useCourses } from "../../hooks/useCourses"
import { useCategories } from "../../hooks/useCategories"
import CoursesPageSkeleton from '../components/ui/loadingSkeleton/CoursesPageSkeleton';
import SearchBar from '../components/courses/SearchBar';
import DesktopSidebar from '../components/courses/DesktopSidebar';
import MobileFilterDrawer from '../components/courses/MobileFilterDrawer';
import MobileFilterInfo from '../components/courses/MobileFilterInfo';
import CourseGrid from '../components/courses/CourseGrid';
import PageTitle from '../components/PageTitle';

const CoursesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlCategoryId = queryParams.get('category');
    const urlSearchQuery = queryParams.get('search') || '';

    const {
        courses,
        fetchCourses,
        loading,
        error,
        pagination
    } = useCourses()

    const {
        categories,
        fetchCategories,
        loading: categoryLoading,
        error: categoryError
    } = useCategories()

    const [searchQuery, setSearchQuery] = useState(urlSearchQuery)
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string | number>>({})
    const [showFilters, setShowFilters] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    // Memoized active category name based on URL
    const activeCategoryName = useMemo(() => {
        if (!urlCategoryId) return 'All Courses';
        const category = categories.find(cat => cat.id.toString() === urlCategoryId);
        return category ? category.name : 'All Courses';
    }, [urlCategoryId, categories])

    // Initialize search query from URL
    useEffect(() => {
        setSearchQuery(urlSearchQuery);
    }, [urlSearchQuery])

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Fetch courses when URL params change
    useEffect(() => {
        const filters: Record<string, string | number> = {}

        if (urlCategoryId) {
            filters.category = urlCategoryId;
        }

        if (urlSearchQuery) {
            filters.search = urlSearchQuery;
        }

        setAppliedFilters(filters);
        fetchCourses(filters);
    }, [urlCategoryId, urlSearchQuery, fetchCourses])

    // Update URL when search query changes (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newParams = new URLSearchParams();

            if (urlCategoryId) {
                newParams.set('category', urlCategoryId);
            }

            if (searchQuery.trim()) {
                newParams.set('search', searchQuery.trim());
            } else {
                newParams.delete('search');
            }

            navigate(`/courses?${newParams.toString()}`, { replace: true });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, urlCategoryId, navigate]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const newParams = new URLSearchParams();

            if (urlCategoryId) {
                newParams.set('category', urlCategoryId);
            }

            if (searchQuery.trim()) {
                newParams.set('search', searchQuery.trim());
            }

            navigate(`/courses?${newParams.toString()}`);
        }
    }

    const clearAllFilters = () => {
        setSearchQuery('');
        navigate('/courses');
    }

    const closeMobileFilters = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowFilters(false);
            setIsClosing(false);
        }, 300);
    }

    // Prevent body scroll when mobile filters are open
    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters]);

    const removeCategoryFilter = () => {
        const newParams = new URLSearchParams();
        if (urlSearchQuery) {
            newParams.set('search', urlSearchQuery);
        }
        navigate(`/courses?${newParams.toString()}`);
    }

    const removeSearchFilter = () => {
        setSearchQuery('');
        const newParams = new URLSearchParams();
        if (urlCategoryId) {
            newParams.set('category', urlCategoryId);
        }
        navigate(`/courses?${newParams.toString()}`);
    }

    if (loading && courses.length === 0) {
        return <CoursesPageSkeleton />
    }

    return (
        <>
            <PageTitle title={`Courses | ${activeCategoryName || 'Global Professional Institute'}`} />
            <Breadcrumb name="Courses" icon={Folder} />

            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchKeyDown={handleSearchKeyDown}
                urlCategoryId={urlCategoryId}
                urlSearchQuery={urlSearchQuery}
                activeCategoryName={activeCategoryName}
                categoriesCount={categories.length}
                onClearAll={clearAllFilters}
                onRemoveCategory={removeCategoryFilter}
                onRemoveSearch={removeSearchFilter}
                onOpenMobileFilters={() => setShowFilters(true)}
            />

            <div className="container mx-auto px-4 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    <DesktopSidebar
                        categories={categories}
                        categoryLoading={categoryLoading}
                        categoryError={categoryError}
                        urlCategoryId={urlCategoryId}
                        urlSearchQuery={urlSearchQuery}
                        activeCategoryName={activeCategoryName}
                        pagination={pagination}
                        onFetchCategories={fetchCategories}
                        onClearAll={clearAllFilters}
                    />

                    <MobileFilterDrawer
                        showFilters={showFilters}
                        isClosing={isClosing}
                        categories={categories}
                        categoryLoading={categoryLoading}
                        categoryError={categoryError}
                        urlCategoryId={urlCategoryId}
                        urlSearchQuery={urlSearchQuery}
                        activeCategoryName={activeCategoryName}
                        onClose={closeMobileFilters}
                        onClearAll={clearAllFilters}
                        onFetchCategories={fetchCategories}
                    />

                    <div className="w-full lg:w-3/4">
                        <MobileFilterInfo
                            urlCategoryId={urlCategoryId}
                            activeCategoryName={activeCategoryName}
                            onOpenFilters={() => setShowFilters(true)}
                        />

                        <CourseGrid
                            courses={courses}
                            error={error}
                            pagination={pagination}
                            appliedFilters={appliedFilters}
                            activeCategoryName={activeCategoryName}
                            urlSearchQuery={urlSearchQuery}
                            onFetchCourses={fetchCourses}
                            onClearAll={clearAllFilters}
                            onOpenMobileFilters={() => setShowFilters(true)}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CoursesPage
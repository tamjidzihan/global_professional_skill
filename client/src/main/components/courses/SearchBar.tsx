/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, X, CircleX, CornerDownLeft, Filter } from "lucide-react"

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    urlCategoryId: string | null;
    urlSearchQuery: string;
    activeCategoryName: string;
    categoriesCount: number;
    onClearAll: () => void;
    onRemoveCategory: () => void;
    onRemoveSearch: () => void;
    onOpenMobileFilters: () => void;
}

const SearchBar = ({
    searchQuery,
    setSearchQuery,
    handleSearchKeyDown,
    urlCategoryId,
    urlSearchQuery,
    activeCategoryName,
    categoriesCount,
    onClearAll,
    onRemoveCategory,
    onRemoveSearch,
    onOpenMobileFilters
}: SearchBarProps) => {
    return (
        <div className="container mx-auto px-3 py-2 mb-2">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-[#0066CC]/20 via-[#0066CC]/30 to-[#0066CC]/20 
                    rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/80 
                    shadow-lg hover:shadow-md transition-all duration-300">

                    <div className="relative p-4 lg:px-6 lg:py-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 lg:gap-5">
                            <SearchHeader />

                            <div className="flex items-center gap-2 flex-1 w-full">
                                <SearchInput
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleSearchKeyDown={handleSearchKeyDown}
                                />
                                <MobileFilterButton
                                    categoriesCount={categoriesCount}
                                    onOpenMobileFilters={onOpenMobileFilters}
                                />
                            </div>
                        </div>

                        {(urlCategoryId || urlSearchQuery) && (
                            <ActiveFilters
                                urlCategoryId={urlCategoryId}
                                urlSearchQuery={urlSearchQuery}
                                activeCategoryName={activeCategoryName}
                                onRemoveCategory={onRemoveCategory}
                                onRemoveSearch={onRemoveSearch}
                                onClearAll={onClearAll}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchHeader = () => (
    <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
            <div className="p-2 rounded-lg bg-linear-to-br from-[#0066CC] to-blue-600 shadow-md">
                <Search className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
        </div>
        <div>
            <h3 className="font-bold text-gray-900 text-sm lg:text-lg tracking-tight leading-tight">
                Find Courses
            </h3>
            <p className="hidden lg:flex text-xs text-gray-500 items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Search by name
            </p>
        </div>
    </div>
)

const SearchInput = ({ searchQuery, setSearchQuery, handleSearchKeyDown }: any) => (
    <div className="relative flex-1 group">
        <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full px-4 py-2.5 pl-10 bg-gray-50/80 border border-gray-200 rounded-xl 
                text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 
                focus:ring-[#0066CC]/20 focus:border-[#0066CC] focus:bg-white transition-all"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        {searchQuery && (
            <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
                <CircleX size={14} className="text-gray-400" />
            </button>
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="px-1.5 py-0.5 border border-gray-200 rounded text-gray-400">
                <CornerDownLeft size={14} />
            </div>
        </div>
    </div>
)

const MobileFilterButton = ({ categoriesCount, onOpenMobileFilters }: any) => (
    <button
        onClick={onOpenMobileFilters}
        className="lg:hidden flex items-center justify-center p-2.5
            bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm
            hover:bg-gray-50 active:scale-95 transition-all relative"
    >
        <Filter className="w-5 h-5" />
        {categoriesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center 
                bg-blue-600 text-[10px] text-white rounded-full font-bold">
                {categoriesCount}
            </span>
        )}
    </button>
)

const ActiveFilters = ({
    urlCategoryId,
    urlSearchQuery,
    activeCategoryName,
    onRemoveCategory,
    onRemoveSearch,
    onClearAll
}: any) => (
    <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
                Filters:
            </span>

            {urlCategoryId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md
                    bg-blue-50 border border-blue-100 text-[#0066CC] text-xs font-medium">
                    <span className="max-w-25 truncate">{activeCategoryName}</span>
                    <X size={14} onClick={onRemoveCategory} className="cursor-pointer hover:text-red-500" />
                </span>
            )}

            {urlSearchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md
                    bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
                    <span className="max-w-25 truncate">"{urlSearchQuery}"</span>
                    <X size={14} onClick={onRemoveSearch} className="cursor-pointer hover:text-red-500" />
                </span>
            )}

            <button
                onClick={onClearAll}
                className="text-[11px] font-semibold text-gray-500 hover:text-red-500 transition-colors ml-auto"
            >
                Clear All
            </button>
        </div>
    </div>
)

export default SearchBar
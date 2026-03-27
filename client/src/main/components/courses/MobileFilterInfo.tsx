import { Filter } from "lucide-react"

interface MobileFilterInfoProps {
    urlCategoryId: string | null;
    activeCategoryName: string;
    onOpenFilters: () => void;
}

const MobileFilterInfo = ({ urlCategoryId, activeCategoryName, onOpenFilters }: MobileFilterInfoProps) => (
    <div className="lg:hidden mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-[#0066CC]" />
                <span className="text-sm text-gray-700">
                    {urlCategoryId ? `Category: ${activeCategoryName}` : 'All Categories'}
                </span>
            </div>
            <button
                onClick={onOpenFilters}
                className="text-sm text-[#0066CC] font-medium hover:underline"
            >
                Change
            </button>
        </div>
    </div>
)

export default MobileFilterInfo
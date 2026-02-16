const CategoryFilterSkeleton = () => {
    return (
        <div className="space-y-2 animate-pulse">
            <div className="w-full h-10 bg-gray-200 rounded mb-2"></div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-full h-9 bg-gray-200 rounded"></div>
            ))}
        </div>
    )
}

export default CategoryFilterSkeleton
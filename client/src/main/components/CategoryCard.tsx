import type { Category } from "../../types";

interface CategoryCardProps {
    category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
    return (
        <div className="category-card">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
        </div>
    )
}

export default CategoryCard
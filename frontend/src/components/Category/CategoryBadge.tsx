import React from 'react';
import { Category } from '../../types';

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => (
  <span
    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
    style={{ backgroundColor: category.color }}
  >
    {category.name}
  </span>
);

export default CategoryBadge;

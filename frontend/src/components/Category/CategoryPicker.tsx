import React from 'react';
import { Category } from '../../types';

interface CategoryPickerProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/** カテゴリをチップで複数選択する */
const CategoryPicker: React.FC<CategoryPickerProps> = ({ categories, selectedIds, onChange }) => {
  if (categories.length === 0) return null;

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="カテゴリ">
      {categories.map((c) => {
        const selected = selectedIds.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            aria-pressed={selected}
            className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              selected
                ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' }
                : { borderColor: c.color, color: c.color }
            }
          >
            {selected ? '✓ ' : ''}{c.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPicker;

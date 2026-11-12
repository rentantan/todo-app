import React, { useState } from 'react';
import categoryService from '../../services/categoryService';
import { Category } from '../../types';
import { getErrorMessage } from '../../utils/errors';

const PRESET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

interface CategoryManagerProps {
  categories: Category[];
  onChanged: () => void;
  onError: (message: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onChanged, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await categoryService.createCategory({ name: name.trim(), color });
      setName('');
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err, 'カテゴリを作成できませんでした。'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const usage = category.todo_count ? `（${category.todo_count}件のタスクから外れます）` : '';
    if (!window.confirm(`カテゴリ「${category.name}」を削除しますか？${usage}`)) return;
    try {
      await categoryService.deleteCategory(category.id);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err, 'カテゴリを削除できませんでした。'));
    }
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-expanded={isOpen}
      >
        {isOpen ? '▼' : '▶'} カテゴリを管理（{categories.length}）
      </button>

      {isOpen && (
        <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 space-y-3">
          <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="新しいカテゴリ名"
              maxLength={100}
              className="input flex-1 min-w-[10rem]"
            />
            <div className="flex gap-1" role="radiogroup" aria-label="カラー">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button type="submit" disabled={isSaving || !name.trim()} className="btn btn-primary">
              追加
            </button>
          </form>

          {categories.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: c.color }}>
                  {c.name}
                  <span className="opacity-80">({c.todo_count ?? 0})</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="w-5 h-5 rounded-full hover:bg-black/20"
                    aria-label={`${c.name} を削除`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

import React, { useState } from 'react';
import { PRIORITIES, PRIORITY_LABELS } from '../../constants';
import { Category, Priority, TodoInput } from '../../types';
import { fromLocalInputValue } from '../../utils/date';
import CategoryPicker from '../Category/CategoryPicker';
import DueDateInput from './DueDateInput';

interface TodoFormProps {
  categories: Category[];
  onCreate: (data: TodoInput) => Promise<boolean>;
  inputRef?: React.Ref<HTMLInputElement>;
}

const INITIAL = { name: '', description: '', priority: 'medium' as Priority, due_date: '', category_ids: [] as string[] };

const TodoForm: React.FC<TodoFormProps> = ({ categories, onCreate, inputRef }) => {
  const [form, setForm] = useState(INITIAL);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    const ok = await onCreate({
      name: form.name.trim(),
      description: form.description.trim(),
      priority: form.priority,
      due_date: fromLocalInputValue(form.due_date),
      category_ids: form.category_ids,
    });
    setIsSubmitting(false);
    // 失敗時は入力内容を残す
    if (ok) setForm((prev) => ({ ...INITIAL, priority: prev.priority, category_ids: prev.category_ids }));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          ref={inputRef}
          placeholder="新しいタスクを入力して Enter（N）"
          maxLength={500}
          className="input flex-1 py-3 text-base"
          aria-label="タスク名"
        />
        <button type="submit" disabled={isSubmitting || !form.name.trim()} className="btn btn-primary px-5">
          {isSubmitting ? '追加中...' : '追加'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-expanded={showDetails}
      >
        {showDetails ? '▼' : '▶'} 詳細（説明・優先度・期限・カテゴリ）
      </button>

      {showDetails && (
        <div className="space-y-3">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="説明（任意）"
            rows={2}
            className="input w-full resize-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <select name="priority" value={form.priority} onChange={handleChange} className="input" aria-label="優先度">
              {PRIORITIES.map((p) => <option key={p} value={p}>優先度: {PRIORITY_LABELS[p]}</option>)}
            </select>
            <DueDateInput value={form.due_date} onChange={(v) => setForm((prev) => ({ ...prev, due_date: v }))} />
          </div>
          <CategoryPicker
            categories={categories}
            selectedIds={form.category_ids}
            onChange={(ids) => setForm((prev) => ({ ...prev, category_ids: ids }))}
          />
        </div>
      )}
    </form>
  );
};

export default TodoForm;

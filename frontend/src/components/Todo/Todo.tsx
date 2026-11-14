import React, { useState } from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { PRIORITIES, PRIORITY_LABELS } from '../../constants';
import { Category, TodoInput, TodoType } from '../../types';
import { formatDateTime, fromLocalInputValue, isOverdue, toLocalInputValue } from '../../utils/date';
import CategoryBadge from '../Category/CategoryBadge';
import CategoryPicker from '../Category/CategoryPicker';

interface TodoProps {
  todo: TodoType;
  categories: Category[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onToggle: (todo: TodoType) => void;
  onUpdate: (id: string, data: Partial<TodoInput>) => Promise<boolean>;
  onDelete: (todo: TodoType) => void;
}

const PRIORITY_STYLES = {
  high: { border: 'border-red-400', badge: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' },
  medium: { border: 'border-yellow-400', badge: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50' },
  low: { border: 'border-green-400', badge: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50' },
};

const toEditState = (todo: TodoType) => ({
  name: todo.name,
  description: todo.description ?? '',
  priority: todo.priority,
  due_date: toLocalInputValue(todo.due_date),
  category_ids: todo.categories.map((c) => c.id),
});

const Todo: React.FC<TodoProps> = ({ todo, categories, dragHandleProps, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState(() => toEditState(todo));
  const [isSaving, setIsSaving] = useState(false);

  const overdue = isOverdue(todo.due_date, todo.completed);
  const styles = PRIORITY_STYLES[todo.priority];

  const startEdit = () => {
    setEdit(toEditState(todo));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!edit.name.trim()) return;
    setIsSaving(true);
    const ok = await onUpdate(todo.id, {
      name: edit.name.trim(),
      description: edit.description.trim(),
      priority: edit.priority,
      due_date: fromLocalInputValue(edit.due_date), // 空にすると期限を削除
      category_ids: edit.category_ids,
    });
    setIsSaving(false);
    if (ok) setIsEditing(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsEditing(false);
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  };

  const cardClass = `p-4 rounded-lg shadow-sm bg-white dark:bg-gray-700/60 border-l-4 ${
    overdue ? 'border-red-600' : styles.border
  } ${todo.completed ? 'opacity-70' : ''}`;

  if (isEditing) {
    return (
      <div className={`${cardClass} space-y-3`} onKeyDown={handleKeyDown}>
        <input name="name" value={edit.name} onChange={handleEditChange} className="input w-full" autoFocus aria-label="タスク名" />
        <textarea name="description" value={edit.description} onChange={handleEditChange}
          placeholder="説明（任意）" rows={2} className="input w-full resize-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select name="priority" value={edit.priority} onChange={handleEditChange} className="input" aria-label="優先度">
            {PRIORITIES.map((p) => <option key={p} value={p}>優先度: {PRIORITY_LABELS[p]}</option>)}
          </select>
          <input type="datetime-local" name="due_date" value={edit.due_date} onChange={handleEditChange} className="input" aria-label="期限" />
        </div>
        <CategoryPicker categories={categories} selectedIds={edit.category_ids}
          onChange={(ids) => setEdit((prev) => ({ ...prev, category_ids: ids }))} />
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={isSaving || !edit.name.trim()} className="btn btn-success">
            {isSaving ? '保存中...' : '保存'}
          </button>
          <button onClick={() => setIsEditing(false)} className="btn btn-ghost">キャンセル</button>
          <span className="ml-auto text-xs text-gray-400 hidden sm:inline">⌘/Ctrl+Enter で保存・Esc でキャンセル</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3">
        {dragHandleProps !== undefined && (
          <span
            {...dragHandleProps}
            className={`select-none text-gray-400 mt-0.5 ${dragHandleProps ? 'cursor-grab hover:text-gray-600' : 'opacity-30 cursor-not-allowed'}`}
            title={dragHandleProps ? 'ドラッグして並び替え' : 'フィルター中は並び替えできません'}
            aria-label="並び替え"
          >
            ⋮⋮
          </span>
        )}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          className="h-5 w-5 accent-green-500 rounded mt-0.5 cursor-pointer"
          aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className={`font-medium break-words cursor-text ${todo.completed ? 'line-through text-gray-400' : ''}`}
              onDoubleClick={startEdit}
              title="ダブルクリックで編集"
            >
              {todo.name}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${styles.badge}`}>{PRIORITY_LABELS[todo.priority]}</span>
            {overdue && <span className="px-2 py-0.5 rounded-full text-xs bg-red-600 text-white">期限切れ</span>}
            {todo.categories.map((c) => <CategoryBadge key={c.id} category={c} />)}
          </div>

          {todo.description && (
            <p className={`text-sm mb-2 whitespace-pre-wrap break-words ${todo.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
              {todo.description}
            </p>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
            {todo.due_date && <span className={overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>⏰ 期限: {formatDateTime(todo.due_date)}</span>}
            {todo.completed_at && <span className="text-green-600 dark:text-green-400">✓ 完了: {formatDateTime(todo.completed_at)}</span>}
            <span>作成: {formatDateTime(todo.created_at)}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={startEdit} className="btn btn-ghost px-2" aria-label="編集" title="編集">✏️</button>
          <button onClick={() => onDelete(todo)} className="btn btn-ghost px-2" aria-label="削除" title="削除">🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default Todo;

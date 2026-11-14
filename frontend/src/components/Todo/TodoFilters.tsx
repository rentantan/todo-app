import React from 'react';
import { PRIORITIES, PRIORITY_LABELS } from '../../constants';
import { Category, Priority, TodoStats } from '../../types';
import { DEFAULT_FILTERS, FilterState, hasActiveFilters } from '../../utils/todoFilters';

interface TodoFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  stats: TodoStats | null;
  categories: Category[];
}

const ToggleChip: React.FC<{ active: boolean; activeClass: string; onClick: () => void; children: React.ReactNode }> = ({
  active, activeClass, onClick, children,
}) => (
  <button type="button" onClick={onClick} aria-pressed={active} className={`chip ${active ? `${activeClass} text-white hover:opacity-90` : ''}`}>
    {children}
  </button>
);

const TodoFilters: React.FC<TodoFiltersProps> = ({ filters, onChange, stats, categories }) => {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3 mb-5">
      <input
        type="search"
        placeholder="🔍 タスクを検索..."
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        className="input w-full"
        aria-label="タスクを検索"
      />

      <div className="flex flex-wrap gap-2">
        <ToggleChip active={filters.status === 'all'} activeClass="!bg-blue-500" onClick={() => set('status', 'all')}>
          すべて ({stats?.total_todos ?? 0})
        </ToggleChip>
        <ToggleChip active={filters.status === 'active'} activeClass="!bg-orange-500" onClick={() => set('status', 'active')}>
          未完了 ({stats?.pending_todos ?? 0})
        </ToggleChip>
        <ToggleChip active={filters.status === 'completed'} activeClass="!bg-green-500" onClick={() => set('status', 'completed')}>
          完了 ({stats?.completed_todos ?? 0})
        </ToggleChip>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filters.priority ?? ''}
          onChange={(e) => set('priority', (e.target.value || undefined) as Priority | undefined)}
          className="input"
          aria-label="優先度で絞り込み"
        >
          <option value="">すべての優先度</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>優先度: {PRIORITY_LABELS[p]}</option>)}
        </select>

        {categories.length > 0 && (
          <select
            value={filters.category ?? ''}
            onChange={(e) => set('category', e.target.value || undefined)}
            className="input"
            aria-label="カテゴリで絞り込み"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <ToggleChip active={filters.showOverdue} activeClass="!bg-red-500" onClick={() => set('showOverdue', !filters.showOverdue)}>
          期限切れ ({stats?.overdue_todos ?? 0})
        </ToggleChip>
        <ToggleChip active={filters.showDueToday} activeClass="!bg-purple-500" onClick={() => set('showDueToday', !filters.showDueToday)}>
          今日期限 ({stats?.due_today_todos ?? 0})
        </ToggleChip>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoFilters;

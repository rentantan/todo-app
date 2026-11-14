import React, { useMemo, useState } from 'react';
import CategoryManager from '../components/Category/CategoryManager';
import Card from '../components/Layout/Card';
import Header from '../components/Layout/Header';
import Toast from '../components/Layout/Toast';
import TodoFilters from '../components/Todo/TodoFilters';
import TodoForm from '../components/Todo/TodoForm';
import TodoList from '../components/Todo/TodoList';
import TodoStatsBar from '../components/Todo/TodoStatsBar';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import { useTodos } from '../hooks/useTodos';
import { DEFAULT_FILTERS, FilterState, hasActiveFilters, toQuery } from '../utils/todoFilters';

interface TodoPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const TodoPage: React.FC<TodoPageProps> = ({ darkMode, onToggleDarkMode }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { toast, notify, notifyError, closeToast } = useToast();

  // 検索欄の入力ごとに API を叩かないよう遅延させる
  const debouncedSearch = useDebounce(filters.search, 300);
  const query = useMemo(
    () => toQuery({ ...filters, search: debouncedSearch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filters.status, filters.priority, filters.category, filters.showOverdue, filters.showDueToday]
  );
  const filtering = hasActiveFilters(filters);

  const {
    todos, stats, categories, isLoading, visibleActive,
    create, toggle, update, remove, reorder, completeVisible, clearCompleted, refreshAll, flushPendingDelete,
  } = useTodos(query, { notify, notifyError });

  return (
    <div className="min-h-screen flex justify-center items-start p-2 sm:p-6">
      <Card>
        <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} onBeforeLogout={flushPendingDelete} />
        <TodoForm categories={categories} onCreate={create} />
        <CategoryManager categories={categories} onChanged={refreshAll} onError={(m) => notify(m, 'error')} />
        <TodoStatsBar stats={stats} />
        <TodoFilters filters={filters} onChange={setFilters} stats={stats} categories={categories} />

        <TodoList
          todos={todos}
          categories={categories}
          isLoading={isLoading}
          canReorder={!filtering}
          hasFilters={filtering}
          onReorder={reorder}
          onToggle={toggle}
          onUpdate={update}
          onDelete={remove}
        />

        <footer className="mt-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button onClick={completeVisible} disabled={visibleActive.length === 0} className="btn btn-success">
              {filtering ? '表示中をすべて完了' : 'すべて完了'}
            </button>
            <button onClick={clearCompleted} disabled={!stats?.completed_todos} className="btn btn-danger">
              完了タスクを削除
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">残りのタスク: {stats?.pending_todos ?? 0} 件</span>
        </footer>
      </Card>
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
};

export default TodoPage;

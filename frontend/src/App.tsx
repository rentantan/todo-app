import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import CategoryManager from './components/Category/CategoryManager';
import Card from './components/Layout/Card';
import Header from './components/Layout/Header';
import Toast, { ToastMessage } from './components/Layout/Toast';
import TodoFilters, { DEFAULT_FILTERS, FilterState, hasActiveFilters } from './components/Todo/TodoFilters';
import TodoForm from './components/Todo/TodoForm';
import TodoList from './components/Todo/TodoList';
import TodoStatsBar from './components/Todo/TodoStatsBar';
import { AuthProvider } from './contexts/AuthContext';
import { useDarkMode } from './hooks/useDarkMode';
import { useDebounce } from './hooks/useDebounce';
import categoryService from './services/categoryService';
import todoService, { TodoInput, TodoQuery } from './services/todoService';
import { Category, TodoStats, TodoType } from './types';
import { getErrorMessage } from './utils/errors';

const toQuery = (f: FilterState): TodoQuery => ({
  search: f.search.trim() || undefined,
  priority: f.priority,
  category: f.category,
  overdue: f.showOverdue,
  due_today: f.showDueToday,
  completed: f.status === 'all' ? undefined : f.status === 'completed',
});

interface TodoAppProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

function TodoApp({ darkMode, onToggleDarkMode }: TodoAppProps) {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 検索欄の入力ごとに API を叩かないよう遅延させる
  const debouncedSearch = useDebounce(filters.search, 300);
  const query = useMemo(
    () => toQuery({ ...filters, search: debouncedSearch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filters.status, filters.priority, filters.category, filters.showOverdue, filters.showDueToday]
  );
  const filtering = hasActiveFilters(filters);

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    setToast({ id: Date.now(), type, text });
  }, []);
  const closeToast = useCallback(() => setToast(null), []);
  const notifyError = useCallback((err: unknown, fallback: string) => notify(getErrorMessage(err, fallback), 'error'), [notify]);

  // 古いリクエストの結果で新しい結果を上書きしないためのカウンター
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [list, s] = await Promise.all([todoService.getTodos(query), todoService.getStats()]);
      if (id !== requestId.current) return;
      setTodos(list);
      setStats(s);
    } catch (err) {
      if (id === requestId.current) notifyError(err, 'タスクの読み込みに失敗しました。');
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [query, notifyError]);

  const reloadCategories = useCallback(async () => {
    try {
      setCategories(await categoryService.getCategories());
    } catch (err) {
      notifyError(err, 'カテゴリの読み込みに失敗しました。');
    }
  }, [notifyError]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  const handleCreate = async (data: TodoInput) => {
    try {
      await todoService.createTodo(data);
      await reload();
      return true;
    } catch (err) {
      notifyError(err, 'タスクを追加できませんでした。');
      return false;
    }
  };

  const handleToggle = async (todo: TodoType) => {
    // 楽観的更新：先に画面へ反映し、失敗したら再取得で戻す
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)));
    try {
      await todoService.toggleTodo(todo.id);
    } catch (err) {
      notifyError(err, '状態を変更できませんでした。');
    }
    reload();
  };

  const handleUpdate = async (id: string, data: Partial<TodoInput>) => {
    try {
      const updated = await todoService.updateTodo(id, data);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      reload();
      reloadCategories();
      return true;
    } catch (err) {
      notifyError(err, 'タスクを更新できませんでした。');
      return false;
    }
  };

  const handleDelete = async (todo: TodoType) => {
    if (!window.confirm(`「${todo.name}」を削除しますか？`)) return;
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await todoService.deleteTodo(todo.id);
      notify('タスクを削除しました。');
    } catch (err) {
      notifyError(err, 'タスクを削除できませんでした。');
    }
    reload();
    reloadCategories();
  };

  const handleReorder = async (reordered: TodoType[]) => {
    const previous = todos;
    setTodos(reordered);
    try {
      await todoService.reorderTodos(reordered.map((t) => t.id));
    } catch (err) {
      setTodos(previous);
      notifyError(err, '並び替えを保存できませんでした。');
    }
  };

  const visibleActive = todos.filter((t) => !t.completed);

  const handleCompleteVisible = async () => {
    try {
      const res = await todoService.bulkUpdate(visibleActive.map((t) => t.id), 'complete');
      notify(res.message);
    } catch (err) {
      notifyError(err, '一括完了に失敗しました。');
    }
    reload();
  };

  const handleClearCompleted = async () => {
    if (!window.confirm(`完了済みのタスク ${stats?.completed_todos ?? 0} 件をすべて削除しますか？`)) return;
    try {
      const res = await todoService.clearCompleted();
      notify(res.message);
    } catch (err) {
      notifyError(err, '削除に失敗しました。');
    }
    reload();
    reloadCategories();
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-2 sm:p-6">
      <Card>
        <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
        <TodoForm categories={categories} onCreate={handleCreate} />
        <CategoryManager categories={categories} onChanged={() => { reloadCategories(); reload(); }} onError={(m) => notify(m, 'error')} />
        <TodoStatsBar stats={stats} />
        <TodoFilters filters={filters} onChange={setFilters} stats={stats} categories={categories} />

        <TodoList
          todos={todos}
          categories={categories}
          isLoading={isLoading}
          canReorder={!filtering}
          hasFilters={filtering}
          onReorder={handleReorder}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <footer className="mt-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button onClick={handleCompleteVisible} disabled={visibleActive.length === 0} className="btn btn-success">
              {filtering ? '表示中をすべて完了' : 'すべて完了'}
            </button>
            <button onClick={handleClearCompleted} disabled={!stats?.completed_todos} className="btn btn-danger">
              完了タスクを削除
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">残りのタスク: {stats?.pending_todos ?? 0} 件</span>
        </footer>
      </Card>
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function App() {
  // ログイン画面にもダークモードを適用するため、最上位で管理する
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TodoApp darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;

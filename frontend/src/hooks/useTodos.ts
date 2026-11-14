import { useCallback, useEffect, useRef, useState } from 'react';
import categoryService from '../services/categoryService';
import todoService, { TodoInput, TodoQuery } from '../services/todoService';
import { Category, TodoStats, TodoType } from '../types';

interface Notifier {
  notify: (text: string) => void;
  notifyError: (err: unknown, fallback: string) => void;
}

/** タスク・統計・カテゴリの取得と、それらを変更する操作をまとめたフック */
export const useTodos = (query: TodoQuery, { notify, notifyError }: Notifier) => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const create = async (data: TodoInput) => {
    try {
      await todoService.createTodo(data);
      await reload();
      return true;
    } catch (err) {
      notifyError(err, 'タスクを追加できませんでした。');
      return false;
    }
  };

  const toggle = async (todo: TodoType) => {
    // 楽観的更新：先に画面へ反映し、失敗したら再取得で戻す
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)));
    try {
      await todoService.toggleTodo(todo.id);
    } catch (err) {
      notifyError(err, '状態を変更できませんでした。');
    }
    reload();
  };

  const update = async (id: string, data: Partial<TodoInput>) => {
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

  const remove = async (todo: TodoType) => {
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

  const reorder = async (reordered: TodoType[]) => {
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

  const completeVisible = async () => {
    try {
      const res = await todoService.bulkUpdate(visibleActive.map((t) => t.id), 'complete');
      notify(res.message);
    } catch (err) {
      notifyError(err, '一括完了に失敗しました。');
    }
    reload();
  };

  const clearCompleted = async () => {
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

  /** カテゴリの追加・削除後は、タスク側のバッジ表示も更新する */
  const refreshAll = () => {
    reloadCategories();
    reload();
  };

  return {
    todos,
    stats,
    categories,
    isLoading,
    visibleActive,
    create,
    toggle,
    update,
    remove,
    reorder,
    completeVisible,
    clearCompleted,
    refreshAll,
  };
};

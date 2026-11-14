import { useCallback, useEffect, useRef, useState } from 'react';
import categoryService from '../services/categoryService';
import todoService from '../services/todoService';
import { Category, TodoInput, TodoQuery, TodoStats, TodoType } from '../types';
import { useConfirm } from '../contexts/ConfirmContext';
import { excludeFromStats } from '../utils/todoStats';
import { NotifyOptions } from './useToast';

/** 削除を取り消せる猶予（ミリ秒） */
const UNDO_MS = 5000;

interface Notifier {
  notify: (text: string, type?: 'success' | 'error', options?: NotifyOptions) => void;
  notifyError: (err: unknown, fallback: string) => void;
}

/** タスク・統計・カテゴリの取得と、それらを変更する操作をまとめたフック */
export const useTodos = (query: TodoQuery, { notify, notifyError }: Notifier) => {
  const confirm = useConfirm();
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 古いリクエストの結果で新しい結果を上書きしないためのカウンター
  const requestId = useRef(0);
  // 「元に戻す」の猶予中で、まだサーバーから削除していないタスク
  const pendingDelete = useRef<{ todo: TodoType; timer: number } | null>(null);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [list, s] = await Promise.all([todoService.getTodos(query), todoService.getStats()]);
      if (id !== requestId.current) return;
      // 取り消し待ちのタスクは、サーバーにはまだ残っているので一覧・統計の両方から除く
      const hidden = pendingDelete.current?.todo;
      setTodos(hidden ? list.filter((t) => t.id !== hidden.id) : list);
      setStats(hidden ? excludeFromStats(s, hidden) : s);
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

  /** 猶予中の削除を確定してサーバーに送る */
  const commitDelete = useCallback(async () => {
    const pending = pendingDelete.current;
    if (!pending) return;
    pendingDelete.current = null;
    window.clearTimeout(pending.timer);
    try {
      await todoService.deleteTodo(pending.todo.id);
    } catch (err) {
      notifyError(err, 'タスクを削除できませんでした。');
    }
    reload();
    reloadCategories();
  }, [notifyError, reload, reloadCategories]);

  const undoDelete = useCallback(() => {
    const pending = pendingDelete.current;
    if (!pending) return;
    pendingDelete.current = null;
    window.clearTimeout(pending.timer);
    reload();
  }, [reload]);

  // 画面を離れる・閉じるときは猶予中の削除を確定する
  const commitRef = useRef(commitDelete);
  commitRef.current = commitDelete;
  useEffect(() => {
    const onUnload = () => {
      if (pendingDelete.current) todoService.deleteTodoOnUnload(pendingDelete.current.todo.id);
    };
    window.addEventListener('pagehide', onUnload);
    return () => {
      window.removeEventListener('pagehide', onUnload);
      commitRef.current();
    };
  }, []);

  /** 確認ダイアログを出さずにすぐ消し、数秒間は「元に戻す」で取り消せるようにする */
  const remove = (todo: TodoType) => {
    commitDelete(); // 前の削除が猶予中なら先に確定する
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setStats((prev) => (prev ? excludeFromStats(prev, todo) : prev));
    pendingDelete.current = { todo, timer: window.setTimeout(commitDelete, UNDO_MS) };
    notify(`「${todo.name}」を削除しました。`, 'success', {
      action: { label: '元に戻す', onClick: undoDelete },
      duration: UNDO_MS,
    });
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
    const ok = await confirm({
      title: '完了タスクを削除しますか？',
      message: `完了済みのタスク ${stats?.completed_todos ?? 0} 件をすべて削除します。この操作は取り消せません。`,
      confirmLabel: '削除',
      danger: true,
    });
    if (!ok) return;
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
    flushPendingDelete: commitDelete,
  };
};

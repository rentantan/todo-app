import { TodoStats, TodoType } from '../types';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** 月曜始まりの週の開始日時（バックエンドの集計と同じ） */
const startOfWeek = (d: Date) => {
  const day = startOfDay(d);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
};

/**
 * 統計からタスク 1 件分を差し引く。
 * 削除の取り消し待ちの間も、一覧と件数表示を一致させるために使う。
 */
export const excludeFromStats = (stats: TodoStats, todo: TodoType, now = new Date()): TodoStats => {
  const dec = (n: number, cond: boolean) => (cond ? Math.max(0, n - 1) : n);
  const due = todo.due_date ? new Date(todo.due_date) : null;
  const completedAt = todo.completed_at ? new Date(todo.completed_at) : null;
  const active = !todo.completed;

  const total = dec(stats.total_todos, true);
  const completed = dec(stats.completed_todos, todo.completed);

  const categories_stats = { ...stats.categories_stats };
  todo.categories.forEach(({ name }) => {
    const c = categories_stats[name];
    if (!c) return;
    categories_stats[name] = {
      total: dec(c.total, true),
      completed: dec(c.completed, todo.completed),
      pending: dec(c.pending, active),
    };
  });

  return {
    ...stats,
    total_todos: total,
    completed_todos: completed,
    pending_todos: dec(stats.pending_todos, active),
    completion_rate: total ? Math.round((completed / total) * 10000) / 100 : 0,
    overdue_todos: dec(stats.overdue_todos, active && !!due && due < now),
    due_today_todos: dec(
      stats.due_today_todos,
      active && !!due && startOfDay(due).getTime() === startOfDay(now).getTime()
    ),
    today_completed: dec(stats.today_completed, !!completedAt && completedAt >= startOfDay(now)),
    week_completed: dec(stats.week_completed, !!completedAt && completedAt >= startOfWeek(now)),
    categories_stats,
  };
};

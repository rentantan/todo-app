import { Priority, TodoQuery } from '../types';

/** 画面上のフィルター状態 */
export interface FilterState {
  status: 'all' | 'active' | 'completed';
  priority?: Priority;
  category?: string;
  search: string;
  showOverdue: boolean;
  showDueToday: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  status: 'all',
  priority: undefined,
  category: undefined,
  search: '',
  showOverdue: false,
  showDueToday: false,
};

export const hasActiveFilters = (f: FilterState) =>
  f.status !== 'all' || !!f.priority || !!f.category || !!f.search.trim() || f.showOverdue || f.showDueToday;

/** フィルター状態 → API のクエリパラメータ */
export const toQuery = (f: FilterState): TodoQuery => ({
  search: f.search.trim() || undefined,
  priority: f.priority,
  category: f.category,
  overdue: f.showOverdue,
  due_today: f.showDueToday,
  completed: f.status === 'all' ? undefined : f.status === 'completed',
});

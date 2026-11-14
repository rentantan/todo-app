import { Category, TodoStats, TodoType } from '../types';
import { excludeFromStats } from './todoStats';

const now = new Date(2026, 10, 14, 12, 0); // 土曜日
const category: Category = { id: 'c1', name: '仕事', color: '#000000', created_at: '', updated_at: '' };

const stats: TodoStats = {
  total_todos: 4,
  completed_todos: 2,
  pending_todos: 2,
  completion_rate: 50,
  overdue_todos: 1,
  due_today_todos: 1,
  today_completed: 1,
  week_completed: 2,
  categories_stats: { 仕事: { total: 2, completed: 1, pending: 1 } },
};

const todo = (patch: Partial<TodoType>): TodoType => ({
  id: 't', name: 't', description: '', completed: false, order_index: 0, priority: 'medium',
  due_date: null, completed_at: null, created_at: '', updated_at: '', categories: [], ...patch,
});

describe('excludeFromStats', () => {
  it('removes an overdue active task', () => {
    const result = excludeFromStats(stats, todo({ due_date: new Date(2026, 10, 13).toISOString(), categories: [category] }), now);
    expect(result).toMatchObject({
      total_todos: 3, completed_todos: 2, pending_todos: 1, overdue_todos: 0, due_today_todos: 1,
      completion_rate: 66.67,
    });
    expect(result.categories_stats['仕事']).toEqual({ total: 1, completed: 1, pending: 0 });
  });

  it('removes a task completed today', () => {
    const result = excludeFromStats(stats, todo({ completed: true, completed_at: new Date(2026, 10, 14, 9).toISOString() }), now);
    expect(result).toMatchObject({ total_todos: 3, completed_todos: 1, pending_todos: 2, today_completed: 0, week_completed: 1 });
  });

  it('counts a task completed earlier this week (Monday) but not today', () => {
    const result = excludeFromStats(stats, todo({ completed: true, completed_at: new Date(2026, 10, 9, 9).toISOString() }), now);
    expect(result).toMatchObject({ today_completed: 1, week_completed: 1 });
  });

  it('never goes below zero', () => {
    const empty = { ...stats, total_todos: 0, completed_todos: 0, pending_todos: 0 };
    expect(excludeFromStats(empty, todo({}), now)).toMatchObject({ total_todos: 0, pending_todos: 0, completion_rate: 0 });
  });
});

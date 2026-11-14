export type Priority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color: string;
  todo_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TodoType {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  order_index: number;
  priority: Priority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

export interface TodoStats {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  completion_rate: number;
  overdue_todos: number;
  due_today_todos: number;
  today_completed: number;
  week_completed: number;
  categories_stats: Record<string, { total: number; completed: number; pending: number }>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

// ---- API リクエスト ----

export interface CategoryInput {
  name: string;
  color?: string;
}

export interface TodoInput {
  name: string;
  description?: string;
  priority?: Priority;
  due_date?: string | null;
  completed?: boolean;
  category_ids?: string[];
}

export interface TodoQuery {
  completed?: boolean;
  priority?: Priority;
  category?: string;
  search?: string;
  overdue?: boolean;
  due_today?: boolean;
  due_this_week?: boolean;
  ordering?: string;
}

export type BulkAction = 'complete' | 'incomplete' | 'delete';

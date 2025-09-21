import apiClient from './api';
import { TodoType } from '../types';

export interface CreateTodoData {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  category_ids?: string[];
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  completed?: boolean;
}

export interface TodoFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  search?: string;
  due_date?: string;
  overdue?: boolean;
  due_today?: boolean;
  due_this_week?: boolean;
}

export interface ReorderData {
  todo_orders: { id: string; order_index: string }[];
}

export interface BulkUpdateData {
  todo_ids: string[];
  action: 'complete' | 'incomplete' | 'delete';
}

export interface TodoStats {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  completion_rate: number;
  overdue_todos: number;
  today_completed: number;
  week_completed: number;
  categories_stats: Record<
    string,
    { total: number; completed: number; pending: number }
  >;
}

export interface TodoListResponse {
  results: TodoType[];
  count: number;
}

class TodoService {
  // Todo一覧取得
  async getTodos(filters?: TodoFilters): Promise<TodoListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<TodoListResponse>(`/todos/?${params.toString()}`);
    return response.data;
  }

  // Todo詳細取得
  async getTodo(id: string): Promise<TodoType> {
    const response = await apiClient.get<TodoType>(`/todos/${id}/`);
    return response.data;
  }

  // Todo作成
  async createTodo(data: CreateTodoData): Promise<TodoType> {
    const response = await apiClient.post<TodoType>('/todos/', data);
    return response.data;
  }

  // Todo更新
  async updateTodo(id: string, data: UpdateTodoData): Promise<TodoType> {
    const response = await apiClient.put<TodoType>(`/todos/${id}/`, data);
    return response.data;
  }

  // Todo削除
  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`/todos/${id}/`);
  }

  // Todo完了状態切り替え
  async toggleTodo(id: string): Promise<TodoType> {
    const response = await apiClient.patch<TodoType>(`/todos/${id}/toggle/`);
    return response.data;
  }

  // Todo並び替え
  async reorderTodos(data: ReorderData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/todos/reorder/', data);
    return response.data;
  }

  // Todo一括操作
  async bulkUpdateTodos(data: BulkUpdateData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/todos/bulk-update/', data);
    return response.data;
  }

  // 完了済みTodo一括削除
  async clearCompletedTodos(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/todos/clear-completed/');
    return response.data;
  }

  // Todo統計情報取得
  async getTodoStats(): Promise<TodoStats> {
    const response = await apiClient.get<TodoStats>('/todos/stats/');
    return response.data;
  }
}

export default new TodoService();

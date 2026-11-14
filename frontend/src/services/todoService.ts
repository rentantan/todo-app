import apiClient from './api';
import { BulkAction, TodoInput, TodoQuery, TodoStats, TodoType } from '../types';

const todoService = {
  async getTodos(query: TodoQuery = {}): Promise<TodoType[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        params[key] = String(value);
      }
    });
    return (await apiClient.get<TodoType[]>('/todos/', { params })).data;
  },
  async createTodo(data: TodoInput): Promise<TodoType> {
    return (await apiClient.post<TodoType>('/todos/', data)).data;
  },
  async updateTodo(id: string, data: Partial<TodoInput>): Promise<TodoType> {
    return (await apiClient.patch<TodoType>(`/todos/${id}/`, data)).data;
  },
  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`/todos/${id}/`);
  },
  async toggleTodo(id: string): Promise<TodoType> {
    return (await apiClient.patch<TodoType>(`/todos/${id}/toggle/`)).data;
  },
  async reorderTodos(orderedIds: string[]): Promise<void> {
    await apiClient.post('/todos/reorder/', {
      todo_orders: orderedIds.map((id, index) => ({ id, order_index: index })),
    });
  },
  async bulkUpdate(ids: string[], action: BulkAction): Promise<{ message: string; count: number }> {
    return (await apiClient.post('/todos/bulk-update/', { todo_ids: ids, action })).data;
  },
  async clearCompleted(): Promise<{ message: string; count: number }> {
    return (await apiClient.delete('/todos/clear-completed/')).data;
  },
  async getStats(): Promise<TodoStats> {
    return (await apiClient.get<TodoStats>('/todos/stats/')).data;
  },
};

export default todoService;

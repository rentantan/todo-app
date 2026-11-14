import apiClient from './api';
import { Category, CategoryInput } from '../types';

const categoryService = {
  async getCategories(): Promise<Category[]> {
    return (await apiClient.get<Category[]>('/categories/')).data;
  },
  async createCategory(data: CategoryInput): Promise<Category> {
    return (await apiClient.post<Category>('/categories/', data)).data;
  },
  async updateCategory(id: string, data: Partial<CategoryInput>): Promise<Category> {
    return (await apiClient.patch<Category>(`/categories/${id}/`, data)).data;
  },
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}/`);
  },
};

export default categoryService;

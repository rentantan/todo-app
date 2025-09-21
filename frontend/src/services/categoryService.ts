import apiClient from './api';

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  color: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CategoryListResponse {
  results: Category[];
  count: number;
}

class CategoryService {
  // カテゴリ一覧取得
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<CategoryListResponse>('/categories/');
    return response.data.results;
  }

  // カテゴリ詳細取得
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}/`);
    return response.data;
  }

  // カテゴリ作成
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post<Category>('/categories/', data);
    return response.data;
  }

  // カテゴリ更新
  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}/`, data);
    return response.data;
  }

  // カテゴリ削除
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}/`);
  }
}

export default new CategoryService();

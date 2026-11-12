import apiClient, { tokenStorage } from './api';
import { RegisterData, User } from '../types';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const saveSession = (data: AuthResponse) => {
  tokenStorage.set(data.access, data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
};

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register/', data);
    saveSession(res.data);
    return res.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login/', data);
    saveSession(res.data);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      const refresh = tokenStorage.getRefresh();
      if (refresh) await apiClient.post('/auth/logout/', { refresh });
    } catch {
      // サーバー側の失敗に関わらずローカルのセッションは破棄する
    } finally {
      tokenStorage.clear();
    }
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  async updateProfile(data: Partial<Pick<User, 'first_name' | 'last_name' | 'username'>>): Promise<User> {
    const res = await apiClient.patch<User>('/auth/profile/', data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/change-password/', data);
    return res.data;
  },

  getCachedUser(): User | null {
    try {
      const str = localStorage.getItem('user');
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  hasSession(): boolean {
    return !!(tokenStorage.getAccess() || tokenStorage.getRefresh());
  },
};

export default authService;

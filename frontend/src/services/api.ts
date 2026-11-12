import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set(access: string, refresh?: string) {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// リクエストごとにアクセストークンを付与
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** セッション切れ時に呼ばれるハンドラ（AuthContext が登録する） */
let onSessionExpired: () => void = () => window.location.reload();
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

// 同時に複数のリクエストが 401 になっても、リフレッシュは 1 回だけ行う
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error('No refresh token');
  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${BASE_URL}/auth/token/refresh/`,
    { refresh }
  );
  // ROTATE_REFRESH_TOKENS=True のため、新しいリフレッシュトークンも保存する
  tokenStorage.set(data.access, data.refresh);
  return data.access;
};

const AUTH_PATHS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRequest = AUTH_PATHS.some((p) => original?.url?.includes(p));

    if (error.response?.status !== 401 || !original || original._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const access = await refreshPromise;
      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original);
    } catch (refreshError) {
      tokenStorage.clear();
      onSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default apiClient;

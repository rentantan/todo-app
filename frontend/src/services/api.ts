import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Axios インスタンス作成
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークン自動付与）
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// レスポンスインターセプター（トークン再取得処理）
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // login/register API はリダイレクトさせない
    const skipRedirectPaths = ['/auth/login/', '/auth/register/'];
    const isAuthRequest = skipRedirectPaths.some(path => originalRequest.url?.includes(path));

    if (!isAuthRequest && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post<{ access: string }>(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const accessToken = response.data.access;
        localStorage.setItem('access_token', accessToken);

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュトークンも無効な場合のみログアウト
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // 認証APIでない場合のみリダイレクト
        if (!isAuthRequest) {
          window.location.reload(); // ページリロードで認証ページに戻る
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
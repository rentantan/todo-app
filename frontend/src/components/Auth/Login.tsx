import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // フィールド入力時にエラーをクリア
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // サーバーからのエラーメッセージを解析
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // 一般的なエラーメッセージフィールドをチェック
        if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (errorData.email && errorData.email.length > 0) {
          setError(`メールアドレス: ${errorData.email[0]}`);
        } else if (errorData.password && errorData.password.length > 0) {
          setError(`パスワード: ${errorData.password[0]}`);
        } else {
          setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        }
      } else if (error.request) {
        // ネットワークエラー
        setError('サーバーに接続できませんでした。インターネット接続を確認してください。');
      } else {
        // その他のエラー
        setError('ログインに失敗しました。しばらく時間をおいてから再試行してください。');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">ログイン</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="パスワードを入力"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
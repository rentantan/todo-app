import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // フィールド入力時にそのフィールドのエラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です。';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください。';
    }
    
    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です。';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります。';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です。';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります。';
    }
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'パスワードが一致しません。';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
    } catch (error: any) {
      console.error('Register error:', error);
      
      // サーバーからのエラーメッセージを解析
      const newErrors: Record<string, string> = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // フィールド別エラーを処理
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field]) && errorData[field].length > 0) {
            newErrors[field] = errorData[field][0];
          } else if (typeof errorData[field] === 'string') {
            newErrors[field] = errorData[field];
          }
        });
        
        // 一般的なエラーメッセージの場合
        if (errorData.detail) {
          newErrors.general = errorData.detail;
        } else if (errorData.message) {
          newErrors.general = errorData.message;
        } else if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          newErrors.general = errorData.non_field_errors[0];
        }
      } else if (error.request) {
        // ネットワークエラー
        newErrors.general = 'サーバーに接続できませんでした。インターネット接続を確認してください。';
      } else {
        // その他のエラー
        newErrors.general = '登録に失敗しました。しばらく時間をおいてから再試行してください。';
      }
      
      setErrors(newErrors);
    }
  };

  const renderError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
      );
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">新規登録</h2>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス *
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
          {renderError('email')}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名 *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ユーザー名を入力"
            required
          />
          {renderError('username')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="太郎"
            />
            {renderError('first_name')}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              姓
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="田中"
            />
            {renderError('last_name')}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8文字以上のパスワード"
            required
          />
          {renderError('password')}
        </div>

        <div>
          <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認） *
          </label>
          <input
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="パスワードを再入力"
            required
          />
          {renderError('password_confirm')}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '登録中...' : '新規登録'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          既にアカウントをお持ちの方は{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
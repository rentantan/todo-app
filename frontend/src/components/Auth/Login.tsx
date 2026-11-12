import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import FormField from './FormField';

const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(getErrorMessage(err, 'ログインに失敗しました。'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">ログイン</h2>

      {error && <div className="alert-error mb-4" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="メールアドレス" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} placeholder="email@example.com" required autoFocus />
        <FormField label="パスワード" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={handleChange} placeholder="パスワードを入力" required />
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2">
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        アカウントをお持ちでない方は{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-blue-500 hover:text-blue-700 font-medium">
          新規登録
        </button>
      </p>
    </div>
  );
};

export default Login;

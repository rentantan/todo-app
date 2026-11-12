import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types';
import { getFieldErrors } from '../../utils/errors';
import FormField from './FormField';

const EMPTY: RegisterData = {
  email: '', username: '', first_name: '', last_name: '', password: '', password_confirm: '',
};

const validate = (form: RegisterData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '正しいメールアドレスを入力してください。';
  if (form.username.trim().length < 3) errors.username = 'ユーザー名は3文字以上で入力してください。';
  if (form.password.length < 8) errors.password = 'パスワードは8文字以上で入力してください。';
  if (form.password !== form.password_confirm) errors.password_confirm = 'パスワードが一致しません。';
  return errors;
};

const Register: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) setErrors(({ [name]: _, general, ...rest }) => rest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({ ...form, email: form.email.trim(), username: form.username.trim() });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setIsSubmitting(false);
    }
  };

  const field = (name: keyof RegisterData) => ({
    name, value: form[name], onChange: handleChange, error: errors[name],
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">新規登録</h2>

      {errors.general && <div className="alert-error mb-4" role="alert">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="メールアドレス" type="email" autoComplete="email" placeholder="email@example.com" required autoFocus {...field('email')} />
        <FormField label="ユーザー名" autoComplete="username" placeholder="3文字以上" required {...field('username')} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="姓" autoComplete="family-name" placeholder="田中" {...field('last_name')} />
          <FormField label="名" autoComplete="given-name" placeholder="太郎" {...field('first_name')} />
        </div>
        <FormField label="パスワード" type="password" autoComplete="new-password" placeholder="8文字以上" required {...field('password')} />
        <FormField label="パスワード（確認）" type="password" autoComplete="new-password" placeholder="もう一度入力" required {...field('password_confirm')} />
        <button type="submit" disabled={isSubmitting} className="btn btn-success w-full py-2">
          {isSubmitting ? '登録中...' : '新規登録'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        既にアカウントをお持ちの方は{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-blue-500 hover:text-blue-700 font-medium">
          ログイン
        </button>
      </p>
    </div>
  );
};

export default Register;

import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

/** ラベル・入力欄・エラーメッセージをまとめた入力フィールド */
const FormField: React.FC<FormFieldProps> = ({ label, name, error, required, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <input
      id={name}
      name={name}
      required={required}
      aria-invalid={!!error}
      className={`input w-full ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default FormField;

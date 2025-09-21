import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await logout();
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-black">
          Todoアプリ
        </h1>
        {user && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            こんにちは、{user.first_name || user.username}さん
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-2 border rounded-lg text-black hover:bg-gray-200 dark:border-white dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? 'ライトモード' : 'ダークモード'}
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default Header;
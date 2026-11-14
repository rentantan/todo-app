import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  /** ログアウト前に済ませておく処理（猶予中の削除の確定など） */
  onBeforeLogout?: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, onBeforeLogout }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return;
    await onBeforeLogout?.();
    logout();
  };

  const displayName = [user?.last_name, user?.first_name].filter(Boolean).join(' ') || user?.username;

  return (
    <header className="flex justify-between items-start gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">📝 Todoアプリ</h1>
        {user && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">こんにちは、{displayName}さん</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleDarkMode}
          className="btn btn-ghost text-lg"
          title={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          aria-label={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={handleLogout} className="btn btn-ghost border border-gray-300 dark:border-gray-600">
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;

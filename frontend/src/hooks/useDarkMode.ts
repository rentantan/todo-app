import { useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';

/** ダークモード状態。初回は OS の設定に合わせ、<html> に dark クラスを付け外しする */
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
};

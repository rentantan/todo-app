import React from 'react';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useDarkMode } from './hooks/useDarkMode';
import TodoPage from './pages/TodoPage';

function App() {
  // ログイン画面にもダークモードを適用するため、最上位で管理する
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TodoPage darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;

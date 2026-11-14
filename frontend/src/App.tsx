import React from 'react';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { useDarkMode } from './hooks/useDarkMode';
import TodoPage from './pages/TodoPage';

function App() {
  // ログイン画面にもダークモードを適用するため、最上位で管理する
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ProtectedRoute>
          <TodoPage darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
        </ProtectedRoute>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;

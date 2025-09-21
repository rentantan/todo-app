import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Card from "./components/Layout/Card";
import Header from "./components/Layout/Header";
import TodoForm from "./components/Todo/TodoForm";
import TodoList from "./components/Todo/TodoList";
import TodoFilters, { FilterState } from "./components/Todo/TodoFilters";
import { TodoType } from "./types";
import todoService, { TodoFilters as APIFilters } from "./services/todoService";

function TodoApp() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    search: '',
    showOverdue: false,
    showDueToday: false
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [todoStats, setTodoStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      // フィルターをAPI形式に変換
      const apiFilters: APIFilters = {
        search: filters.search || undefined,
        priority: filters.priority,
        overdue: filters.showOverdue || undefined,
        due_today: filters.showDueToday || undefined
      };

      // ステータスフィルター
      if (filters.status === 'active') {
        apiFilters.completed = false;
      } else if (filters.status === 'completed') {
        apiFilters.completed = true;
      }

      const response = await todoService.getTodos(apiFilters);
      setTodos(response.results);

      // 統計情報を更新
      const allTodos = await todoService.getTodos({});
      const completed = allTodos.results.filter(todo => todo.completed).length;
      const active = allTodos.results.length - completed;
      const overdue = allTodos.results.filter(todo => 
        todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed
      ).length;

      setTodoStats({
        total: allTodos.results.length,
        active,
        completed,
        overdue
      });

    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filters]);

  const handleReorder = async (reorderedTodos: TodoType[]) => {
    // オプティミスティックアップデート
    setTodos(reorderedTodos);

    try {
      const reorderData = {
        todo_orders: reorderedTodos.map((todo, index) => ({
          id: todo.id,
          order_index: String(index)
        }))
      };
      await todoService.reorderTodos(reorderData);
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      // エラー時は元の順序に戻す
      fetchTodos();
    }
  };

  const handleClearCompleted = async () => {
    if (!window.confirm('完了済みのタスクをすべて削除しますか？')) return;

    try {
      await todoService.clearCompletedTodos();
      fetchTodos();
    } catch (error) {
      console.error('Failed to clear completed todos:', error);
    }
  };

  const handleBulkComplete = async () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    if (activeTodos.length === 0) return;

    try {
      await todoService.bulkUpdateTodos({
        todo_ids: activeTodos.map(todo => todo.id),
        action: 'complete'
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to bulk complete todos:', error);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start p-4">
        <Card>
          <Header darkMode={darkMode} setDarkMode={setDarkMode} />

          <TodoForm onTodoAdded={fetchTodos} />

          <TodoFilters 
            filters={filters}
            onFiltersChange={setFilters}
            todoStats={todoStats}
          />

          <TodoList
            todos={todos}
            onReorder={handleReorder}
            onTodoUpdated={fetchTodos}
            isLoading={isLoading}
          />

          {/* アクションボタン */}
          <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleClearCompleted}
                disabled={todoStats.completed === 0}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                完了タスクを削除
              </button>
              <button
                onClick={handleBulkComplete}
                disabled={todoStats.active === 0}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                すべて完了
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              残りのタスク: {todoStats.active}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TodoApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
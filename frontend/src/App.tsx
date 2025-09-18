import React, { useState, useEffect } from "react";
import Card from "./components/Layout/Card";
import TodoForm from "./components/Todo/TodoForm";
import TodoList from "./components/Todo/TodoList";
import { TodoType } from "./types";

function App() {
  const [todos, setTodos] = useState<TodoType[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (name: string) => {
    setTodos([...todos, { id: crypto.randomUUID(), name, completed: false }]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id: string, newName: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, name: newName } : todo));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start p-4">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-black">
              Todoアプリ
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2 py-1 border rounded text-black hover:bg-gray-200"
            >
              {darkMode ? "ライトモード" : "ダークモード"}
            </button>
          </div>

          <TodoForm addTodo={addTodo} />

          <div className="flex gap-2 mb-2">
            <button onClick={() => setFilter("all")} className="px-2 py-1 border rounded text-black hover:bg-gray-200">すべて</button>
            <button onClick={() => setFilter("active")} className="px-2 py-1 border rounded text-black hover:bg-gray-200">未完了</button>
            <button onClick={() => setFilter("completed")} className="px-2 py-1 border rounded text-black hover:bg-gray-200">完了</button>
          </div>

          <TodoList
            todos={filteredTodos}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
            setTodos={setTodos}
          />

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearCompleted}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              完了タスクを削除
            </button>
            <span className="text-black">残りのタスク: {todos.filter(todo => !todo.completed).length}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;

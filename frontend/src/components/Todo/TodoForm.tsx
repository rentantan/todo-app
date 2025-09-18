import React, { useRef } from "react";

interface TodoFormProps {
  addTodo: (name: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ addTodo }) => {
  const todoNameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = todoNameRef.current?.value.trim();
    if (!name) return;
    addTodo(name);
    if (todoNameRef.current) todoNameRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        ref={todoNameRef}
        type="text"
        placeholder="新しいタスクを入力"
        className="flex-1 p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        追加
      </button>
    </form>
  );
};

export default TodoForm;

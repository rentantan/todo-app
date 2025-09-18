import React, { useState } from "react";
import { TodoType } from "../../types";

interface TodoProps {
  todo: TodoType;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newName: string) => void;
}

const Todo: React.FC<TodoProps> = ({
  todo,
  toggleTodo,
  deleteTodo,
  editTodo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(todo.name);

  const handleSave = () => {
    editTodo(todo.id, newName);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-md shadow-md bg-white">
      {isEditing ? (
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            保存
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-5 w-5 accent-green-500 rounded-full"
            />
            <span className={`text-gray-800 ${todo.completed ? "line-through" : ""}`}>
              {todo.name}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-white px-3 py-1 roundedhover:bg-yellow-600"
            >
              編集
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              削除
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Todo;

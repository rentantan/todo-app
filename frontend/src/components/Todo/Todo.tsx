import React, { useState } from "react";
import { TodoType } from "../../types";
import todoService from "../../services/todoService";

interface TodoProps {
  todo: TodoType;
  onTodoUpdated: () => void;
}

const Todo: React.FC<TodoProps> = ({ todo, onTodoUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: todo.name,
    description: todo.description || "",
    priority: todo.priority,
    due_date: todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await todoService.toggleTodo(todo.id);
      onTodoUpdated();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('このタスクを削除しますか？')) return;
    
    setIsUpdating(true);
    try {
      await todoService.deleteTodo(todo.id);
      onTodoUpdated();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await todoService.updateTodo(todo.id, {
        name: editData.name,
        description: editData.description || undefined,
        priority: editData.priority,
        due_date: editData.due_date || undefined
      });
      setIsEditing(false);
      onTodoUpdated();
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  return (
    <div className={`p-4 rounded-lg shadow-md bg-white border-l-4 ${
      isOverdue ? 'border-red-500' : 
      todo.priority === 'high' ? 'border-red-400' :
      todo.priority === 'medium' ? 'border-yellow-400' : 'border-green-400'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleEditChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            placeholder="説明（任意）"
            rows={2}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              name="priority"
              value={editData.priority}
              onChange={handleEditChange}
              className="p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
            >
              <option value="low">優先度: 低</option>
              <option value="medium">優先度: 中</option>
              <option value="high">優先度: 高</option>
            </select>
            <input
              type="datetime-local"
              name="due_date"
              value={editData.due_date}
              onChange={handleEditChange}
              className="p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              {isUpdating ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggle}
              disabled={isUpdating}
              className="h-5 w-5 accent-green-500 rounded mt-0.5 disabled:opacity-50"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                  {todo.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(todo.priority)}`}>
                  {getPriorityText(todo.priority)}
                </span>
                {isOverdue && (
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                    期限切れ
                  </span>
                )}
              </div>
              
              {todo.description && (
                <p className={`text-sm mb-2 ${todo.completed ? "line-through text-gray-400" : "text-gray-600"}`}>
                  {todo.description}
                </p>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                {todo.due_date && (
                  <div>期限: {formatDueDate(todo.due_date)}</div>
                )}
                <div>作成: {formatDueDate(todo.created_at)}</div>
                {todo.completed_at && (
                  <div className="text-green-600">完了: {formatDueDate(todo.completed_at)}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
            >
              {isUpdating ? "削除中..." : "削除"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Todo;
import React, { useState } from "react";
import todoService from "../../services/todoService";

interface TodoFormProps {
  onTodoAdded: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onTodoAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const todoData = {
        name: formData.name,
        description: formData.description || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined
      };
      
      await todoService.createTodo(todoData);
      
      // フォームをリセット
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        due_date: ""
      });
      
      onTodoAdded();
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="新しいタスクを入力"
          className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="説明（任意）"
            rows={2}
            className="w-full p-2 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        
        <div>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="low">優先度: 低</option>
            <option value="medium">優先度: 中</option>
            <option value="high">優先度: 高</option>
          </select>
        </div>
        
        <div>
          <input
            type="datetime-local"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full p-2 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "追加中..." : "追加"}
      </button>
    </form>
  );
};

export default TodoForm;
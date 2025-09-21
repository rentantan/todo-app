import React from 'react';

export interface FilterState {
  status: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  search: string;
  showOverdue: boolean;
  showDueToday: boolean;
}

interface TodoFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  todoStats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  filters,
  onFiltersChange,
  todoStats
}) => {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 検索バー */}
      <div>
        <input
          type="text"
          placeholder="タスクを検索..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('status', 'all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.status === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて ({todoStats.total})
        </button>
        <button
          onClick={() => handleFilterChange('status', 'active')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.status === 'active'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          未完了 ({todoStats.active})
        </button>
        <button
          onClick={() => handleFilterChange('status', 'completed')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.status === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          完了 ({todoStats.completed})
        </button>
      </div>

      {/* 優先度・特殊フィルター */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">全ての優先度</option>
          <option value="high">優先度: 高</option>
          <option value="medium">優先度: 中</option>
          <option value="low">優先度: 低</option>
        </select>

        <button
          onClick={() => handleFilterChange('showOverdue', !filters.showOverdue)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.showOverdue
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          期限切れのみ ({todoStats.overdue})
        </button>

        <button
          onClick={() => handleFilterChange('showDueToday', !filters.showDueToday)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filters.showDueToday
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          今日期限
        </button>
      </div>

      {/* フィルタークリア */}
      <button
        onClick={() => onFiltersChange({
          status: 'all',
          priority: undefined,
          search: '',
          showOverdue: false,
          showDueToday: false
        })}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        フィルターをクリア
      </button>
    </div>
  );
};

export default TodoFilters;
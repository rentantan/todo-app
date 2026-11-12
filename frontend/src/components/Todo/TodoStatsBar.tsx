import React from 'react';
import { TodoStats } from '../../types';

const TodoStatsBar: React.FC<{ stats: TodoStats | null }> = ({ stats }) => {
  if (!stats || stats.total_todos === 0) return null;
  const rate = Math.round(stats.completion_rate);

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
        <span>
          進捗 <strong>{stats.completed_todos}</strong> / {stats.total_todos}（{rate}%）
        </span>
        <span>今日 {stats.today_completed} 件・今週 {stats.week_completed} 件完了</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar"
        aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
};

export default TodoStatsBar;

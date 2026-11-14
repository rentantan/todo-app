import { Priority } from './types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

/** セレクトボックスに並べる順（高 → 低） */
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

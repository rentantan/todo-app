import React from 'react';
import { toLocalInputValue } from '../../utils/date';

interface DueDateInputProps {
  /** <input type="datetime-local"> 形式の値（未設定なら空文字） */
  value: string;
  onChange: (value: string) => void;
}

/** 今日から days 日後の 23:59 */
const endOfDay = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return toLocalInputValue(d.toISOString());
};

const PRESETS = [
  { label: '今日中', days: 0 },
  { label: '明日', days: 1 },
  { label: '1週間後', days: 7 },
];

/** 期限の入力欄と、よく使う期限をワンタップで設定するボタン */
const DueDateInput: React.FC<DueDateInputProps> = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-full"
      aria-label="期限"
    />
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map(({ label, days }) => {
        const preset = endOfDay(days);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(preset)}
            aria-pressed={value === preset}
            className={`chip !px-2.5 !py-0.5 !text-xs ${value === preset ? '!bg-blue-500 text-white' : ''}`}
          >
            {label}
          </button>
        );
      })}
      {value && (
        <button type="button" onClick={() => onChange('')} className="chip !px-2.5 !py-0.5 !text-xs">
          期限なし
        </button>
      )}
    </div>
  </div>
);

export default DueDateInput;

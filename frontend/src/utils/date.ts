const pad = (n: number) => String(n).padStart(2, '0');

/** ISO 文字列 → <input type="datetime-local"> 用のローカル時刻文字列 */
export const toLocalInputValue = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** <input type="datetime-local"> の値 → タイムゾーン付き ISO 文字列（空なら null） */
export const fromLocalInputValue = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export const isOverdue = (dueDate: string | null, completed: boolean) =>
  !!dueDate && !completed && new Date(dueDate) < new Date();

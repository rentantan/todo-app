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

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** 暦の上で何日離れているか（a が b より後なら正） */
const calendarDayDiff = (a: Date, b: Date) =>
  Math.round(
    (new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
      new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()) / DAY_MS
  );

/** 「今日 18:00」「明日 9:00」「11/20(木) 18:00」のような短い表記 */
export const formatRelativeDateTime = (iso: string, now = new Date()): string => {
  const d = new Date(iso);
  const time = `${d.getHours()}:${pad(d.getMinutes())}`;
  const diff = calendarDayDiff(d, now);
  if (diff === 0) return `今日 ${time}`;
  if (diff === 1) return `明日 ${time}`;
  if (diff === -1) return `昨日 ${time}`;
  const year = d.getFullYear() === now.getFullYear() ? '' : `${d.getFullYear()}/`;
  return `${year}${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]}) ${time}`;
};

export type DueStatus = 'overdue' | 'today' | 'soon' | 'later';

/** 期限までの状態と、「あと3日」「2日超過」といった補足 */
export const describeDue = (iso: string, now = new Date()): { status: DueStatus; hint: string } => {
  const d = new Date(iso);
  const diff = calendarDayDiff(d, now);
  if (d < now) return { status: 'overdue', hint: diff <= -1 ? `${-diff}日超過` : '' };
  if (diff === 0) return { status: 'today', hint: '' };
  if (diff <= 2) return { status: 'soon', hint: diff >= 2 ? `あと${diff}日` : '' };
  return { status: 'later', hint: diff <= 7 ? `あと${diff}日` : '' };
};

import { describeDue, formatRelativeDateTime, fromLocalInputValue, isOverdue, toLocalInputValue } from './date';

const now = new Date(2026, 10, 14, 12, 0); // 2026/11/14(土) 12:00
const iso = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).toISOString();

describe('formatRelativeDateTime', () => {
  it.each([
    [iso(2026, 11, 14, 18, 5), '今日 18:05'],
    [iso(2026, 11, 15, 9, 0), '明日 9:00'],
    [iso(2026, 11, 13, 9, 0), '昨日 9:00'],
    [iso(2026, 11, 20, 18, 0), '11/20(金) 18:00'],
    [iso(2027, 1, 2, 18, 0), '2027/1/2(土) 18:00'],
  ])('%s → %s', (value, expected) => {
    expect(formatRelativeDateTime(value, now)).toBe(expected);
  });
});

describe('describeDue', () => {
  it.each([
    [iso(2026, 11, 12, 9), { status: 'overdue', hint: '2日超過' }],
    [iso(2026, 11, 14, 9), { status: 'overdue', hint: '' }],
    [iso(2026, 11, 14, 20), { status: 'today', hint: '' }],
    [iso(2026, 11, 15, 20), { status: 'soon', hint: '' }],
    [iso(2026, 11, 16, 20), { status: 'soon', hint: 'あと2日' }],
    [iso(2026, 11, 19, 20), { status: 'later', hint: 'あと5日' }],
    [iso(2026, 12, 1, 20), { status: 'later', hint: '' }],
  ])('%s', (value, expected) => {
    expect(describeDue(value, now)).toEqual(expected);
  });
});

describe('datetime-local conversion', () => {
  it('round-trips through local input value', () => {
    const value = iso(2026, 11, 14, 9, 30);
    expect(toLocalInputValue(value)).toBe('2026-11-14T09:30');
    expect(fromLocalInputValue('2026-11-14T09:30')).toBe(value);
  });

  it('treats empty values as no due date', () => {
    expect(toLocalInputValue(null)).toBe('');
    expect(fromLocalInputValue('')).toBeNull();
  });
});

describe('isOverdue', () => {
  it('is false for completed or undated tasks', () => {
    expect(isOverdue(iso(2000, 1, 1), true)).toBe(false);
    expect(isOverdue(null, false)).toBe(false);
    expect(isOverdue(iso(2000, 1, 1), false)).toBe(true);
  });
});

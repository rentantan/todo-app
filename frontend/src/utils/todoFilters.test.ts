import { DEFAULT_FILTERS, hasActiveFilters, toQuery } from './todoFilters';

describe('hasActiveFilters', () => {
  it('is false for the defaults and whitespace-only search', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: '   ' })).toBe(false);
  });

  it.each([
    { status: 'active' as const },
    { priority: 'high' as const },
    { category: 'c1' },
    { search: 'milk' },
    { showOverdue: true },
    { showDueToday: true },
  ])('is true when %o is set', (patch) => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, ...patch })).toBe(true);
  });
});

describe('toQuery', () => {
  it('maps the default filters to an empty-ish query', () => {
    expect(toQuery(DEFAULT_FILTERS)).toEqual({
      search: undefined, priority: undefined, category: undefined,
      overdue: false, due_today: false, completed: undefined,
    });
  });

  it('maps status and trims search', () => {
    expect(toQuery({ ...DEFAULT_FILTERS, status: 'completed', search: ' a ' })).toMatchObject({ completed: true, search: 'a' });
    expect(toQuery({ ...DEFAULT_FILTERS, status: 'active' })).toMatchObject({ completed: false });
  });
});

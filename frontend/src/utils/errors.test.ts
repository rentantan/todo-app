import { getErrorMessage, getFieldErrors } from './errors';

const httpError = (data: unknown) => ({ response: { data }, request: {} });

describe('getErrorMessage', () => {
  it('explains network errors', () => {
    expect(getErrorMessage({ request: {} })).toMatch('サーバーに接続できませんでした');
  });

  it.each([
    [{ detail: 'D' }, 'D'],
    [{ error: 'E' }, 'E'],
    [{ message: 'M' }, 'M'],
    [{ name: ['名前は必須です。'] }, '名前は必須です。'],
    ['<html>500</html>', 'fallback'],
    [{}, 'fallback'],
  ])('%o → %s', (data, expected) => {
    expect(getErrorMessage(httpError(data), 'fallback')).toBe(expected);
  });
});

describe('getFieldErrors', () => {
  it('maps DRF field errors and non-field errors to general', () => {
    expect(getFieldErrors(httpError({ email: ['使用済み'], non_field_errors: ['NG'] }))).toEqual({
      email: '使用済み',
      general: 'NG',
    });
  });

  it('falls back to a general message', () => {
    expect(getFieldErrors({ request: {} }).general).toMatch('サーバーに接続できませんでした');
  });
});

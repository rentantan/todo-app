/** DRF のエラーレスポンスから、表示用の 1 行メッセージを取り出す */
export const getErrorMessage = (error: any, fallback = 'エラーが発生しました。'): string => {
  const data = error?.response?.data;
  if (!error?.response && error?.request) {
    return 'サーバーに接続できませんでした。バックエンドが起動しているか確認してください。';
  }
  if (!data) return fallback;
  if (typeof data === 'string') return fallback;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  if (data.message) return data.message;
  const first = Object.values(data)[0];
  if (Array.isArray(first) && first.length > 0) return String(first[0]);
  if (typeof first === 'string') return first;
  return fallback;
};

/** DRF のエラーレスポンスをフィールド名 → メッセージの形に変換する */
export const getFieldErrors = (error: any): Record<string, string> => {
  const data = error?.response?.data;
  const result: Record<string, string> = {};
  if (!data || typeof data !== 'object') {
    result.general = getErrorMessage(error);
    return result;
  }
  Object.entries(data).forEach(([key, value]) => {
    const msg = Array.isArray(value) ? value[0] : value;
    if (typeof msg === 'string') result[key === 'non_field_errors' || key === 'detail' ? 'general' : key] = msg;
  });
  return result;
};

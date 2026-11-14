import { useCallback, useState } from 'react';
import { ToastMessage } from '../components/Layout/Toast';
import { getErrorMessage } from '../utils/errors';

/** トースト表示の状態と通知用ヘルパー */
export const useToast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    setToast({ id: Date.now(), type, text });
  }, []);
  const notifyError = useCallback(
    (err: unknown, fallback: string) => notify(getErrorMessage(err, fallback), 'error'),
    [notify]
  );
  const closeToast = useCallback(() => setToast(null), []);

  return { toast, notify, notifyError, closeToast };
};

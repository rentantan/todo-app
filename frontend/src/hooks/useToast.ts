import { useCallback, useState } from 'react';
import { ToastMessage } from '../components/Layout/Toast';
import { getErrorMessage } from '../utils/errors';

export type NotifyOptions = Pick<ToastMessage, 'action' | 'duration'>;

/** トースト表示の状態と通知用ヘルパー */
export const useToast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback(
    (text: string, type: ToastMessage['type'] = 'success', options: NotifyOptions = {}) => {
      setToast({ id: Date.now(), type, text, ...options });
    },
    []
  );
  const notifyError = useCallback(
    (err: unknown, fallback: string) => notify(getErrorMessage(err, fallback), 'error'),
    [notify]
  );
  const closeToast = useCallback(() => setToast(null), []);

  return { toast, notify, notifyError, closeToast };
};

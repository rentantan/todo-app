import React, { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

const Toast: React.FC<{ toast: ToastMessage | null; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onClose, toast.type === 'error' ? 5000 : 2500);
    return () => clearTimeout(id);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center gap-3 ${
        toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800 dark:bg-gray-700'
      }`}
    >
      {toast.text}
      <button onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="閉じる">×</button>
    </div>
  );
};

export default Toast;

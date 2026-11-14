import React, { useEffect, useRef } from 'react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  /** 削除など取り消せない操作。確認ボタンを赤くし、初期フォーカスをキャンセルに置く */
  danger?: boolean;
}

interface ConfirmDialogProps extends ConfirmOptions {
  onClose: (confirmed: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, confirmLabel = 'OK', danger, onClose }) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (danger ? cancelRef : confirmRef).current?.focus();
    return () => previous?.focus();
  }, [danger]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose(false);
    }
    // フォーカスをダイアログ内の 2 つのボタンに閉じ込める
    if (e.key === 'Tab') {
      e.preventDefault();
      (document.activeElement === cancelRef.current ? confirmRef : cancelRef).current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onMouseDown={(e) => e.target === e.currentTarget && onClose(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-message' : undefined}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 shadow-2xl p-5"
      >
        <h2 id="confirm-title" className="text-lg font-semibold mb-2">{title}</h2>
        {message && <p id="confirm-message" className="text-sm text-gray-600 dark:text-gray-300 mb-5">{message}</p>}
        <div className={`flex justify-end gap-2 ${message ? '' : 'mt-5'}`}>
          <button ref={cancelRef} onClick={() => onClose(false)} className="btn btn-ghost">
            キャンセル
          </button>
          <button ref={confirmRef} onClick={() => onClose(true)} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

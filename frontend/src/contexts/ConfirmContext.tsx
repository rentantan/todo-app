import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import ConfirmDialog, { ConfirmOptions } from '../components/Layout/ConfirmDialog';

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

/** window.confirm の代わりに使う、Promise を返す確認ダイアログ */
export const useConfirm = (): ConfirmFn => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider');
  return confirm;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise((resolve) => setRequest({ ...options, resolve })),
    []
  );

  const handleClose = (confirmed: boolean) => {
    request?.resolve(confirmed);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          title={request.title}
          message={request.message}
          confirmLabel={request.confirmLabel}
          danger={request.danger}
          onClose={handleClose}
        />
      )}
    </ConfirmContext.Provider>
  );
};

import { useEffect, useRef } from 'react';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** 入力中でないときに 1 文字キーで呼ばれるショートカット */
export const useShortcut = (key: string, handler: () => void) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      // ダイアログ表示中は反応させない
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key]);
};

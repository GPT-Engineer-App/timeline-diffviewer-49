import { useCallback, useEffect, useLayoutEffect } from 'react';

export const useContentSync = (textareaRef, overlayRef) => {
  const syncScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [textareaRef, overlayRef]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [syncScroll, textareaRef]);

  useLayoutEffect(() => {
    syncScroll();
  }, [syncScroll]);

  return { syncScroll };
};
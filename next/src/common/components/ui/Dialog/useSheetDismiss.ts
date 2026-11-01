'use client';

import { animate, useMotionValue } from 'framer-motion';
import { RefObject, useEffect, useLayoutEffect, useRef } from 'react';

export const useSheetDismiss = ({
  contentRef,
  enabled,
  reducedMotion,
  onClose,
}: {
  contentRef: RefObject<HTMLDivElement>;
  enabled: boolean;
  reducedMotion: boolean | null;
  onClose: () => void;
}) => {
  const y = useMotionValue(0);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !enabled) return;

    let start: { x: number; y: number } | null = null;
    let dragging = false;
    let suppressClick = false;
    let restore: ReturnType<typeof animate> | undefined;

    const reset = () => {
      start = null;
      if (dragging) restore = animate(y, 0, { duration: reducedMotion ? 0 : 0.2 });
      dragging = false;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (dragging) reset();
      start = null;
      suppressClick = false;
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.touches.length !== 1 ||
        y.isAnimating() ||
        !target ||
        target.closest('dialog') !== content.closest('dialog') ||
        target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"]')
      ) return;

      // Check only when the touch begins. Scrolling to the top later cannot take over.
      for (let element: Element | null = target; element && element !== content; element = element.parentElement) {
        const style = getComputedStyle(element);
        if (style.touchAction === 'none') return;
        if (/(auto|scroll)/.test(style.overflowY) && element.scrollTop > 1) return;
      }

      restore?.stop();
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!start) return;
      if (event.touches.length !== 1 || !event.cancelable) {
        reset();
        return;
      }
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;
      if (!dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
        if (dy <= 0 || dy <= Math.abs(dx)) {
          start = null;
          return;
        }
        dragging = true;
        suppressClick = true;
      }
      event.preventDefault();
      y.set(Math.max(0, dy));
    };

    const onTouchEnd = () => {
      const dismiss = dragging && y.get() >= content.clientHeight * 0.2;
      reset();
      if (dismiss) onCloseRef.current();
    };

    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    };

    content.addEventListener('touchstart', onTouchStart, { passive: true });
    content.addEventListener('touchmove', onTouchMove, { passive: false });
    content.addEventListener('touchend', onTouchEnd);
    content.addEventListener('touchcancel', reset);
    content.addEventListener('click', onClick, true);
    return () => {
      restore?.stop();
      content.removeEventListener('touchstart', onTouchStart);
      content.removeEventListener('touchmove', onTouchMove);
      content.removeEventListener('touchend', onTouchEnd);
      content.removeEventListener('touchcancel', reset);
      content.removeEventListener('click', onClick, true);
    };
  }, [contentRef, enabled, reducedMotion, y]);

  return y;
};

'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useSortSectionScroll(initialCustom: boolean, ready: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const standardRef = useRef<HTMLElement>(null);
  const customRef = useRef<HTMLElement>(null);
  const pending = useRef(true);

  useEffect(() => {
    if (!pending.current || !ready) return;
    const frame = requestAnimationFrame(() => {
      const scroll = scrollRef.current;
      const target = initialCustom ? customRef.current : standardRef.current;
      if (!pending.current || !scroll || !target) return;
      pending.current = false;
      const top = scroll.scrollTop + target.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroll.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'instant' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialCustom, ready]);

  const cancelInitialScroll = useCallback(() => { pending.current = false; }, []);
  return { scrollRef, standardRef, customRef, cancelInitialScroll };
}

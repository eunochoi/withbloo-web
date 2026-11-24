'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/common/utils/cn';

export default function ScrollableName({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [markerLeft, setMarkerLeft] = useState<number | null>(null);
  const characters = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(name), ({ segment }) => segment)
    : Array.from(name);

  useEffect(() => {
    const element = ref.current;
    const marker = markerRef.current;
    if (!element || !marker) return;
    let active = true;
    element.scrollLeft = 0;
    const measure = () => {
      if (!active) return;
      if (element.scrollWidth - element.clientWidth - element.scrollLeft <= 1) {
        setMarkerLeft(null);
        return;
      }
      const viewport = element.getBoundingClientRect();
      const limit = viewport.right - marker.getBoundingClientRect().width;
      let boundary = viewport.left;
      for (const character of Array.from(element.firstElementChild?.children ?? [])) {
        const rect = character.getBoundingClientRect();
        if (rect.right > limit) break;
        if (rect.right > viewport.left) boundary = rect.right;
      }
      setMarkerLeft(Math.max(0, boundary - viewport.left));
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    observer?.observe(marker);
    void document.fonts?.ready.then(measure);
    element.addEventListener('scroll', measure);
    return () => {
      active = false;
      observer?.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [name]);
  return (
    <span className={cn('relative block min-w-0 max-w-full', className)} title={name}>
      <span ref={ref} className="block min-w-0 max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span>{characters.map((character, index) => <span key={index}>{character}</span>)}</span>
      </span>
      <span ref={markerRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0">…</span>
      {markerLeft !== null && <span aria-hidden="true" className="pointer-events-none absolute -right-px bottom-0 top-0 bg-theme-surface text-left" style={{ left: markerLeft }}>…</span>}
    </span>
  );
}

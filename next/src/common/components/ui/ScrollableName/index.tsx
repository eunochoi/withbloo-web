'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/common/utils/cn';

export default function ScrollableName({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => setExpanded(false), [name]);
  useEffect(() => {
    const element = ref.current;
    if (!element || expanded) return;
    let active = true;
    const measure = () => {
      if (active) setOverflow(element.scrollWidth > element.clientWidth);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    void document.fonts?.ready.then(measure);
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [name, expanded]);
  const toggle = () => {
    if (!expanded && !overflow) return;
    if (expanded && ref.current) ref.current.scrollLeft = 0;
    setExpanded(!expanded);
  };
  return (
    <span
      ref={ref}
      title={name}
      role={overflow || expanded ? 'button' : undefined}
      tabIndex={overflow || expanded ? 0 : undefined}
      aria-expanded={overflow || expanded ? expanded : undefined}
      className={cn('block min-w-0 max-w-full whitespace-nowrap', expanded ? 'overflow-x-auto' : 'truncate', className)}
      onClick={(event) => {
        if (expanded || overflow || (ref.current && ref.current.scrollWidth > ref.current.clientWidth)) {
          event.preventDefault();
          event.stopPropagation();
          if (!expanded && !overflow) setExpanded(true);
          else toggle();
        }
      }}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && (expanded || overflow)) {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }
      }}
    >{name}</span>
  );
}

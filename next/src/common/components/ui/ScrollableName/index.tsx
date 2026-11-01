'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/common/utils/cn';

export default function ScrollableName({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [name]);
  return (
    <span
      ref={ref}
      title={name}
      className={cn('block min-w-0 max-w-full whitespace-nowrap', expanded ? 'overflow-x-auto' : 'truncate', className)}
      onClick={(event) => {
        if (expanded || (ref.current && ref.current.scrollWidth > ref.current.clientWidth)) {
          event.preventDefault();
          event.stopPropagation();
          if (expanded && ref.current) ref.current.scrollLeft = 0;
          setExpanded(!expanded);
        }
      }}
    >{name}</span>
  );
}

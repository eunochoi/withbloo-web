'use client';

import { useEffect, useRef } from 'react';
import { cn } from "@/common/utils/cn";

export const underlineTitleClass = "pb-2 pt-2 text-base font-normal text-theme-text-primary";

export const titleMarkerClass = "h-2 w-2 shrink-0 rounded-full bg-theme-accent";

interface AppUnderlineTabsOption<T extends string | number> {
  label: string;
  value: T;
}

interface AppUnderlineTabsProps<T extends string | number> {
  options: AppUnderlineTabsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollToSelected?: boolean;
  accessibilityLabel?: string;
}

const AppUnderlineTabs = <T extends string | number>({
  options,
  value,
  onChange,
  scrollToSelected = false,
  accessibilityLabel,
}: AppUnderlineTabsProps<T>) => {
  const container = useRef<HTMLDivElement>(null);
  const selected = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!scrollToSelected || !container.current || !selected.current) return;
    const parent = container.current;
    const tab = selected.current;
    const left = parent.scrollLeft + tab.getBoundingClientRect().left - parent.getBoundingClientRect().left - (parent.clientWidth - tab.offsetWidth) / 2;
    parent.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [value, scrollToSelected]);
  return (
    <div ref={container} role="tablist" aria-label={accessibilityLabel} className={cn("mx-1 flex items-center gap-3", scrollToSelected && "overflow-x-auto overscroll-x-contain")}>
      {options.map((option) => (
        <button
          key={option.value}
          ref={value === option.value ? selected : undefined}
          role="tab"
          aria-selected={value === option.value}
          className={cn(
            underlineTitleClass,
            "flex shrink-0 items-center gap-2 pr-2",
            value === option.value
              ? "text-theme-text-primary"
              : "font-normal text-theme-text-tertiary/70",
          )}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span aria-hidden="true" className={cn(titleMarkerClass, value !== option.value && "bg-theme-text-tertiary/70")} />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AppUnderlineTabs;

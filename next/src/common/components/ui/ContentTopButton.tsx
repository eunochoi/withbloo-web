import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function ContentTopButtons({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-3">{children}</div>;
}

export function ContentTopButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className="flex min-h-11 items-center gap-1 text-sm text-theme-accent disabled:opacity-40">{children}</button>;
}

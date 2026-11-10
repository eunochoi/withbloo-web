import type { ReactNode } from 'react';

export const BOTTOM_SHEET_HEADING_CLASS = 'text-center text-xl font-semibold tracking-tight text-theme-text-primary';

export function BottomSheetHeading({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return <h2 id={id} className={`${BOTTOM_SHEET_HEADING_CLASS} ${className}`}>{children}</h2>;
}

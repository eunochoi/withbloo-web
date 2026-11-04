import type { ReactNode } from 'react';

export default function PickerInfoCard({ children }: { children: ReactNode }) {
  return <div className="flex min-h-32 items-center gap-3 rounded-2xl border border-theme-accent/20 bg-theme-accent/10 p-4">{children}</div>;
}

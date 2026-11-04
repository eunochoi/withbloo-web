import { forwardRef, type ReactNode } from 'react';

const PickerGridItem = forwardRef<HTMLButtonElement, { selected: boolean; label: string; onClick: () => void; children: ReactNode }>(function PickerGridItem({ selected, label, onClick, children }, ref) {
  return <button ref={ref} type="button" aria-label={label} aria-pressed={selected} onClick={onClick} className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-4 rounded-2xl border p-2 ${selected ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' : 'border-transparent text-theme-text-primary'}`}>
    {children}
    <span className="text-center text-sm font-normal leading-5 tracking-tight">{label}</span>
  </button>;
});
export default PickerGridItem;

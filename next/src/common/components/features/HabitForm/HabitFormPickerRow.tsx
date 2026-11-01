import { ChevronRightIcon } from '@/common/constants/appIcons';
import type { ReactNode } from 'react';


const HabitFormPickerRow = ({ label, accessibilityLabel, leading, disabled = false, onClick }: {
  label: string; accessibilityLabel: string; leading?: ReactNode; disabled?: boolean; onClick: () => void;
}) => (
  <button type="button" aria-label={`${accessibilityLabel}, ${label}`} disabled={disabled} onClick={onClick}
    className="flex min-h-12 w-full items-center gap-3 bg-transparent px-2 py-2 text-left transition-opacity hover:opacity-70 disabled:opacity-40">
    {leading}<span className="min-w-0 flex-1 text-base text-theme-text-primary">{label}</span>
    <ChevronRightIcon className="shrink-0 text-2xl text-theme-text-secondary" aria-hidden="true" />
  </button>
);

export default HabitFormPickerRow;

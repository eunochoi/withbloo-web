import { ChevronRightIcon } from '@/common/constants/appIcons';

export function FilterPickerRow({ label, accessibilityLabel, onClick }: {
  label: string;
  accessibilityLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${accessibilityLabel}, ${label}`}
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-between rounded-xl border border-theme-border/70 px-4 text-theme-text-secondary"
    >
      {label}
      <ChevronRightIcon size={20} aria-hidden="true" />
    </button>
  );
}

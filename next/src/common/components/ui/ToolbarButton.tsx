import { ReactNode } from "react";

interface Props {
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const ToolbarButton = ({ 'aria-label': ariaLabel, 'aria-pressed': ariaPressed, children, onClick, disabled = false, title }: Props) => (
  <button
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    className="flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-1 text-sm font-medium leading-snug text-theme-text-secondary transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:text-theme-accent"
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

export default ToolbarButton;

import { ReactNode } from "react";
import { cn } from '@/common/utils/cn';

const buttonSizes = {
  default: 'min-h-10 min-w-0 text-base',
  list: 'min-h-[44px] min-w-0 text-sm',
  listIcon: 'min-h-[44px] w-[44px] shrink-0 text-sm',
};

interface Props {
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  variant?: keyof typeof buttonSizes;
}

const ToolbarButton = ({ 'aria-label': ariaLabel, 'aria-pressed': ariaPressed, children, onClick, disabled = false, title, variant = 'default' }: Props) => (
  <button
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    className={cn(
      'flex items-center justify-center gap-1.5 rounded-md px-1 font-medium leading-snug text-theme-text-secondary transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:text-theme-accent',
      buttonSizes[variant],
    )}
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

export default ToolbarButton;

import { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

export const SettingChoiceGrid = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('my-2 grid grid-cols-3 gap-2', className)} {...props} />
);

export const SettingChoice = ({ className, 'aria-checked': checked, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-checked': boolean }) => (
  <button type="button" role="radio" aria-checked={checked} className={cn(
    'flex h-24 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-2',
    checked ? 'border-theme-accent bg-theme-accent-light/50 text-theme-accent' : 'border-transparent text-theme-text-primary',
    className,
  )} {...props} />
);

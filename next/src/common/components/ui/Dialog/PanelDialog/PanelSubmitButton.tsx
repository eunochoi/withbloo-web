'use client';

import { ButtonHTMLAttributes } from 'react';

type PanelSubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export const PanelSubmitButton = ({ children, ...props }: PanelSubmitButtonProps) => {
  return (
    <button
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-theme-overlay/15 bg-theme-accent px-5 py-3 text-base font-semibold text-theme-text-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

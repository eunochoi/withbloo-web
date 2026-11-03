'use client';

import { ButtonHTMLAttributes } from 'react';

type PanelSubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export const PanelSubmitButton = ({ children, ...props }: PanelSubmitButtonProps) => {
  return (
    <button
      className="flex min-h-11 items-center justify-center gap-1 px-2 text-lg font-normal text-theme-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

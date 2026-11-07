'use client';

import { ButtonHTMLAttributes } from 'react';

type BottomSheetSubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export const BottomSheetSubmitButton = ({ children, ...props }: BottomSheetSubmitButtonProps) => {
  return (
    <button
      className="flex min-h-11 items-center justify-center gap-1 text-lg font-normal text-theme-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

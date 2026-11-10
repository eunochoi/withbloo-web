import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  headerButton?: ReactNode;
  className: string;
  rightClassName?: string;
};

export function BottomSheetHeader({ children, headerButton, className, rightClassName }: Props) {
  return (
    <div className={className}>
      {children}
      {headerButton && <div className={rightClassName}>{headerButton}</div>}
    </div>
  );
}

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  headerLeft?: ReactNode;
  headerButton?: ReactNode;
  className: string;
  leftClassName: string;
  rightClassName?: string;
};

export function BottomSheetHeader({ children, headerLeft, headerButton, className, leftClassName, rightClassName }: Props) {
  return (
    <div className={className}>
      {children}
      {headerLeft && <div className={leftClassName}>{headerLeft}</div>}
      {headerButton && <div className={rightClassName}>{headerButton}</div>}
    </div>
  );
}

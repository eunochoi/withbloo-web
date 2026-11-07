import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  className: string;
  leftClassName: string;
  rightClassName?: string;
};

export function BottomSheetHeader({ children, headerLeft, headerRight, className, leftClassName, rightClassName }: Props) {
  return (
    <div className={className}>
      {children}
      {headerLeft && <div className={leftClassName}>{headerLeft}</div>}
      {headerRight && <div className={rightClassName}>{headerRight}</div>}
    </div>
  );
}

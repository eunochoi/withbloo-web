import type { ReactNode } from "react";

export const PickerHeader = ({
  children,
  headerLeft,
}: {
  children: ReactNode;
  headerLeft?: ReactNode;
}) => (
  <div className="relative mb-4 flex min-h-11 items-center justify-center px-20">
    {headerLeft && (
      <div className="absolute left-0 flex items-center">{headerLeft}</div>
    )}
    {children}
  </div>
);

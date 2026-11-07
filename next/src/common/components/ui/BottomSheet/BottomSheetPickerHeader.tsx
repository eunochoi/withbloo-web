import type { ReactNode } from "react";
import { BottomSheetHeader } from "./BottomSheetHeader";

export const BottomSheetPickerHeader = ({
  children,
  headerLeft,
}: {
  children: ReactNode;
  headerLeft?: ReactNode;
}) => (
  <BottomSheetHeader
    className="relative flex min-h-11 items-center justify-center px-20"
    headerLeft={headerLeft}
    leftClassName="absolute left-0 flex items-center"
  >
    {children}
  </BottomSheetHeader>
);

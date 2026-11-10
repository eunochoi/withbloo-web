import type { ReactNode } from "react";
import { BottomSheetHeader } from "./BottomSheetHeader";

export const BottomSheetPickerHeader = ({
  children,
}: {
  children: ReactNode;
}) => (
  <BottomSheetHeader
    className="relative flex min-h-11 items-center justify-center px-20"
  >
    {children}
  </BottomSheetHeader>
);

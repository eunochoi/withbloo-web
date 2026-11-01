import { cn } from "@/common/utils/cn";
import { forwardRef } from "react";

interface Props {
  edge: 'top' | 'bottom';
}

export const ScrollBoundary = forwardRef<HTMLDivElement, Props>(({ edge }, ref) => {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 h-1",
        edge === 'top' ? "top-0" : "bottom-0",
      )}
    />
  );
});

ScrollBoundary.displayName = 'ScrollBoundary';

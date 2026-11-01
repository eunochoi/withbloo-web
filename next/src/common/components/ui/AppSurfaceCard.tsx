import { forwardRef, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const AppSurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge("border-[1px] border-theme-accent/30 rounded-[20px] bg-theme-surface shadow-card w-full p-3 px-4", className)}
      {...props}
    />
  ),
);
AppSurfaceCard.displayName = "AppSurfaceCard";

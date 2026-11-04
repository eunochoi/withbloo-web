import { cn } from "@/common/utils/cn";

interface Props {
  className?: string;
  edge: 'top' | 'bottom';
  visible: boolean;
}

export const ScrollEdgeFade = ({ className, edge, visible }: Props) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none transition-opacity duration-[400ms] ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-theme-surface", edge === 'top' ? "mask-scroll-fade-top" : "mask-scroll-fade-bottom")} />
      <div className={cn("absolute inset-x-0 h-2 bg-theme-surface", edge === 'top' ? "top-0" : "bottom-0")} />
    </div>
  );
};

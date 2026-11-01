import { cn } from "@/common/utils/cn";

interface Props {
  className?: string;
  edge: 'top' | 'bottom';
  visible: boolean;
}

export const ScrollEdgeFade = ({ className, edge, visible }: Props) => {
  return (
    <div
      className={cn(
        "pointer-events-none bg-theme-surface transition-[opacity,background-color] duration-[400ms] ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        edge === 'top' ? "mask-scroll-fade-top" : "mask-scroll-fade-bottom",
        className,
      )}
    />
  );
};

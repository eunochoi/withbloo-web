import { cn } from "@/common/utils/cn";

interface IndicatorProps {
  page: number;
  indicatorLength: number;
  position?: 'overlay' | 'below';
}

const Indicator = ({
  page,
  indicatorLength,
  position = 'overlay',
}: IndicatorProps) => {
  return (
    <div
      className={cn(
        "flex shrink-0 justify-center py-1.5",
        position === 'overlay' && "absolute inset-x-0 bottom-1 z-10",
      )}
    >
      {[...Array(indicatorLength)].map((_: any, i: number) => {
        const current = page === i;
        return (
          <span
            key={`indicator${i}`}
            className={cn(
              "m-[3px] h-2 rounded-[20px] transition-all duration-200 ease-in-out",
              current ? "bg-theme-accent w-5" : "bg-theme-accent/80 w-2",
            )}
            aria-current={current ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
};

export default Indicator;

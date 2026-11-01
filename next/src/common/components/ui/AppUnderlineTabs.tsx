import { cn } from "@/common/utils/cn";

export const underlineTitleClass = "pb-2 pt-2 text-base font-normal text-theme-text-primary";

export const titleMarkerClass = "h-2 w-2 shrink-0 rounded-full bg-theme-accent";

interface AppUnderlineTabsOption<T extends string | number> {
  label: string;
  value: T;
}

interface AppUnderlineTabsProps<T extends string | number> {
  options: AppUnderlineTabsOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const AppUnderlineTabs = <T extends string | number>({
  options,
  value,
  onChange,
}: AppUnderlineTabsProps<T>) => {
  return (
    <div className="mx-1 flex items-center gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          className={cn(
            underlineTitleClass,
            "flex items-center gap-2 pr-2",
            value === option.value
              ? "text-theme-text-primary"
              : "font-normal text-theme-text-tertiary/70",
          )}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span aria-hidden="true" className={cn(titleMarkerClass, value !== option.value && "bg-theme-text-tertiary/70")} />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AppUnderlineTabs;

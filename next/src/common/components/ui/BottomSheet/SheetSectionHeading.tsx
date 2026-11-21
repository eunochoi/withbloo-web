import type { IconType } from 'react-icons';

export function SheetSectionHeading({ icon: Icon, title, toggle }: {
  icon: IconType;
  title: string;
  toggle?: { checked: boolean; onChange: (checked: boolean) => void };
}) {
  const content = (
    <>
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-theme-accent" />
      <span className="min-w-0 flex-1">{title}</span>
    </>
  );
  const className = 'flex items-center gap-2 text-lg font-semibold';
  if (toggle) {
    return (
      <label className={`${className} cursor-pointer`}>
        {content}
        <input type="checkbox" role="switch" checked={toggle.checked}
          onChange={(event) => toggle.onChange(event.currentTarget.checked)} className="peer sr-only" />
        <span
          aria-hidden="true"
          className="relative h-7 w-12 shrink-0 rounded-full bg-[rgb(var(--theme-switch-track))] transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-[rgb(var(--theme-switch-thumb))] after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-theme-accent"
        />
      </label>
    );
  }
  return <h3 className={className}>{content}</h3>;
}

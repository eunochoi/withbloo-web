'use client';

import { BG_TRANSITION_CLASS } from "@/common/constants/transitions";
import { useNavItems } from "@/common/hooks/useNavItems";
import { cn } from "@/common/utils/cn";
import { twMerge } from "tailwind-merge";

const BottomNav = () => {
  const { items, current, navigate } = useNavItems();
  const mainItems = items.slice(0, -1);
  const lastItem = items.at(-1)!;

  const navItemsWrapperClass = twMerge('border-[1px] border-theme-accent/25 pointer-events-auto flex items-center rounded-full bg-theme-surface shadow-[0_3px_12px_rgb(var(--theme-shadow-color)/0.1)]',
    BG_TRANSITION_CLASS,
    "transition-[background-color,border-color]");
  const navItemClass = cn('flex cursor-pointer items-center justify-center rounded-full text-[clamp(22px,1.5rem,24px)]', BG_TRANSITION_CLASS);
  const activeNavItemClass = 'bg-theme-accent text-theme-text-on-accent';
  const inactiveNavItemClass = "bg-transparent text-theme-accent/80";

  return (
    <nav className="flex max-w-full items-center gap-[calc(8*var(--nav-unit))] [--nav-unit:min(1px,calc((100vw_-_24px)/354))]" aria-label="주요 메뉴">
      <div className={cn(navItemsWrapperClass, 'h-[calc(64*var(--nav-unit))] gap-[calc(0.5*var(--nav-unit))] px-[calc(4*var(--nav-unit))]')}>
        {mainItems.map(({ key, segment, icon: Icon, href, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(href)}
            aria-label={label}
            aria-current={current === segment ? 'page' : undefined}
            className={cn(navItemClass, 'h-[calc(52*var(--nav-unit))] w-[calc(54*var(--nav-unit))] shrink-0')}
          >
            <span className={cn('flex h-[calc(52*var(--nav-unit))] w-[calc(52*var(--nav-unit))] items-center justify-center rounded-full', BG_TRANSITION_CLASS, current === segment ? activeNavItemClass : inactiveNavItemClass)}>
              <Icon />
            </span>
          </button>
        ))}
      </div>
      <div className={cn('h-[calc(64*var(--nav-unit))] w-[calc(64*var(--nav-unit))] shrink-0', navItemsWrapperClass)}>
        <button
          type="button"
          onClick={() => navigate(lastItem.href)}
          aria-label={lastItem.label}
          aria-current={current === lastItem.segment ? 'page' : undefined}
          className={cn(navItemClass, 'h-full w-full', current === lastItem.segment ? activeNavItemClass : inactiveNavItemClass)}
        >
          <lastItem.icon />
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;

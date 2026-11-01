'use client';

import { BG_TRANSITION_CLASS } from '@/common/constants/transitions';
import { useNavItems } from '@/common/hooks/useNavItems';
import { cn } from '@/common/utils/cn';
import Wordmark from '../Wordmark';

const SideBar = () => {
  const { items, current, navigate } = useNavItems();

  return (
    <aside className={cn("bg-theme-bg flex h-full w-full flex-col  overflow-y-auto border-r border-theme-border/75 px-3 py-8 desktop:px-5", BG_TRANSITION_CLASS)}>
      <button type="button" onClick={() => navigate('/home')} aria-label="위블 홈" className="mb-10 self-center rounded-lg desktop:ml-3 desktop:self-start">
        <Wordmark className="text-[28px] desktop:text-[36px]" />
      </button>
      <nav className="flex flex-col gap-2" aria-label="주요 메뉴">
        {items.map(({ key, segment, icon: Icon, href, label }) => (
          <button key={key} type="button" onClick={() => navigate(href)} aria-label={label} aria-current={current === segment ? 'page' : undefined}
            className={cn("flex min-h-12 items-center justify-center gap-3 rounded-xl px-3 text-sm desktop:justify-start border-[1px]", BG_TRANSITION_CLASS,
              current === segment ? "bg-theme-accent-light border-theme-accent/30 text-theme-accent-deep" : "border-transparent text-theme-text-secondary desktop:hover:bg-theme-surface/50")}>
            <Icon className="shrink-0 text-xl" />
            <span className="hidden desktop:block">{label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto hidden px-3 pt-12 text-xs leading-relaxed text-theme-text-secondary desktop:block">
        <p>어떤 하루든<br />모두 나의 기록으로</p>
        <p className="mt-5 whitespace-nowrap text-[10px] text-theme-text-tertiary">어떤 색의 하루라도 괜찮아요.</p>
      </div>
    </aside>
  );
};

export default SideBar;

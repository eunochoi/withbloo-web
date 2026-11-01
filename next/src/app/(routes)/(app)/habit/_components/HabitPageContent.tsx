'use client';

import { AddIcon } from '@/common/constants/appIcons';

import type { HabitPageData } from '@/common/actions/habit/types';
import EmptyStateCard from '@/common/components/ui/EmptyStateCard';
import { MAX_HABIT_COUNT } from '@/common/constants/habit';
import { cn } from '@/common/utils/cn';

import HabitBox from './HabitBox';
import HabitFlow from './HabitFlow';

interface Props {
  habits?: HabitPageData[];
  todayString: string;
  totalHabitCount: number;
  showProgress: boolean;
  onAddHabit: () => void;
}

const HabitPageContent = ({ habits = [], todayString, totalHabitCount, showProgress, onAddHabit }: Props) => {
  const entries: (HabitPageData | 'add')[] = totalHabitCount ? [
    ...habits,
    ...(totalHabitCount < MAX_HABIT_COUNT ? ['add' as const] : []),
  ] : [];
  const itemCount = entries.length;
  return (
    <section className="w-full desktop:grid desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:items-start desktop:gap-x-8">
      {showProgress && <aside className="hidden min-w-0 desktop:sticky desktop:top-[max(112px,calc(var(--page-toolbar-height,0px)+24px))] desktop:col-start-2 desktop:row-start-1 desktop:block desktop:self-start desktop:border-l desktop:border-theme-border/60 desktop:pl-8"><HabitFlow today={todayString} /></aside>}
      <section className={cn('flex min-w-0 flex-col desktop:col-start-1 desktop:row-start-1', !showProgress && 'desktop:col-span-2')}>
        <div className="grid w-full min-w-0 grid-cols-2">
          {entries.map((item, index) => {
            return <div key={typeof item === 'string' ? item : item.id} className={cn(
              'min-w-0 border-theme-border/50 bg-theme-surface',
              index % 2 === 0 && 'border-r',
              index < Math.ceil(itemCount / 2) * 2 - 2 && 'border-b',
            )}>
              {item === 'add' ? (
                <button type="button" aria-label="습관 추가" onClick={onAddHabit} className="flex h-full min-h-56 w-full flex-col items-center justify-center gap-2 px-2 py-4 transition-opacity hover:opacity-65">
                  <AddIcon className="text-[2rem] text-theme-accent" aria-hidden="true" />
                  <span className="text-center text-xs text-theme-text-tertiary">({totalHabitCount}/{MAX_HABIT_COUNT})</span>
                </button>
              ) : <HabitBox id={item.id} name={item.name} priority={item.priority} iconKey={item.iconKey} startedDate={item.startedDate} iconColor={item.iconColor} recentDateStatus={item.recentDateStatus} todayString={todayString} />}
            </div>;
          })}
          {itemCount % 2 === 1 && <div aria-hidden="true" />}
        </div>
        {habits.length === 0 && <EmptyStateCard description={totalHabitCount ? '필터 조건을 바꿔보세요.' : '작은 목표 하나부터 만들어 보아요.'} title={totalHabitCount ? '선택한 조건의 습관이 없어요.' : '아직 만든 습관이 없어요.'} />}
      </section>
    </section>
  );
};

export default HabitPageContent;

'use client';

import { LockIcon } from '@/common/constants/appIcons';

import type { HabitsByDate } from '@/common/actions/habit';
import { useRouter } from 'next/navigation';

import DayInfoSectionHeader from '../DayInfoSectionHeader';
import DayInfoHabitItem from './DayInfoHabitItem';

const emptyMessageClassName =
  'py-4 text-center text-sm leading-relaxed text-theme-text-tertiary desktop:text-sm';

interface Props {
  habitData?: HabitsByDate;
  pendingHabitId: number | null;
  onToggleHabit: (habitId: number, completed: boolean) => Promise<void>;
}

const DayInfoHabitSection = ({
  habitData,
  pendingHabitId,
  onToggleHabit,
}: Props) => {
  const router = useRouter();

  const habits = habitData?.habits ?? [];

  const completedHabitCount = habitData?.summary.completed ?? 0;
  const totalHabitCount = habitData?.summary.total ?? 0;
  const freeCompleted = habitData?.summary.excludedCompleted ?? 0;

  const onOpenHabitInfo = (habitId: number) => {
    router.push(`/habit/${habitId}`, {
      scroll: false,
    });
  };

  return (
    <div className="min-w-0 p-1 desktop:flex desktop:min-h-0 desktop:flex-1 desktop:flex-col">
      <DayInfoSectionHeader
        title="습관 목록"
      >
        {habitData?.isFuture ? (
          <span className="flex items-center gap-1 text-xs text-theme-text-tertiary desktop:text-sm">
            <LockIcon className="text-sm" />
            기록 전
          </span>
        ) : habitData?.canEdit ? (
          <span className="text-xs text-theme-accent desktop:text-sm">
            {completedHabitCount}/{totalHabitCount} 완료
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-theme-text-tertiary desktop:text-sm">
            <LockIcon className="text-sm" />
            {completedHabitCount}개 완료
          </span>
        )}
      </DayInfoSectionHeader>

      {freeCompleted > 0 && <p className="px-2 pt-2 text-xs text-theme-text-secondary">자유 기록 {freeCompleted}건</p>}
      <div className="px-2 py-3 desktop:min-h-0 desktop:flex-1 desktop:overflow-y-auto desktop:overscroll-contain">
        {habitData?.isFuture ? (
          <p className={emptyMessageClassName}>
            미래 날짜에는 습관을 기록할 수 없어요.
          </p>
        ) : habits.length > 0 ? (
          <div className="flex flex-col gap-2">
            {habits.map((habit) => (
              <DayInfoHabitItem
                key={habit.id}
                habit={habit}
                canEdit={habitData?.canEdit === true}
                pendingHabitId={pendingHabitId}
                onOpenHabitInfo={onOpenHabitInfo}
                onToggleHabit={onToggleHabit}
              />
            ))}


          </div>
        ) : (
          <p className={emptyMessageClassName}>
            이날은 등록된 습관 항목이 없어요.
          </p>
        )}
      </div>
    </div>
  );
};

export default DayInfoHabitSection;
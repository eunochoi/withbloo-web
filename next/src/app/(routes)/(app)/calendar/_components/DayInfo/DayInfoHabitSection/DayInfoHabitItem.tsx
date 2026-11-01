
import ScrollableName from '@/common/components/ui/ScrollableName';
import { CheckIcon, ChevronRightIcon } from '@/common/constants/appIcons';
import type { HabitByDate } from '@/common/actions/habit';
import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { cn } from '@/common/utils/cn';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';


interface Props {
  habit: HabitByDate;
  canEdit: boolean;
  pendingHabitId: number | null;
  onOpenHabitInfo: (habitId: number) => void;
  onToggleHabit: (habitId: number, completed: boolean) => Promise<void>;
}

const DayInfoHabitItem = ({ habit, canEdit, pendingHabitId, onOpenHabitInfo, onToggleHabit }: Props) => {
  const color = resolveHabitIconColor(habit.iconColor);
  const isPending = pendingHabitId === habit.id;

  return (
    <div className={cn('flex w-full items-center justify-between gap-2 transition-opacity', isPending && 'opacity-50')}>
      <button
        className={cn(
          'flex min-h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left',
          canEdit ? 'cursor-pointer' : 'cursor-default',
        )}
        disabled={!canEdit || !habit.canEdit || pendingHabitId !== null}
        onClick={() => void onToggleHabit(habit.id, habit.completed)}
        type="button"
        aria-pressed={habit.completed}
      >
        <span
          aria-hidden="true"
          style={{ borderColor: `color-mix(in srgb, ${color} ${habit.completed ? 75 : 60}%, transparent)`, ...(habit.completed ? { backgroundColor: `color-mix(in srgb, ${color} 75%, transparent)` } : {}) }}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 motion-reduce:transition-none',
            habit.completed
              ? 'border-theme-accent/75 bg-theme-accent/75 text-theme-text-on-accent'
              : 'border-theme-text-disabled/60 bg-theme-surface',
          )}
        >
          <CheckIcon className={cn('h-3.5 w-3.5 transition-opacity motion-reduce:transition-none', habit.completed ? 'opacity-100' : 'opacity-0')} />
        </span>
        <ScrollableName name={habit.name} className="flex-1 text-sm" />
        <span className="shrink-0" >
          {habit.priority === 0 ? <span className="text-xs text-theme-text-secondary">자유 기록</span> : <HabitPriority priority={habit.priority} color={color} className="gap-0 text-sm" />}
        </span>
      </button>
      <button
        className="flex h-6 w-6 shrink-0 items-center justify-center text-theme-text-disabled"
        onClick={() => onOpenHabitInfo(habit.id)}
        type="button"
        aria-label={`${habit.name} 습관 정보 보기`}
      >
        <ChevronRightIcon className="text-xl" />
      </button>
    </div>
  );
};

export default DayInfoHabitItem;

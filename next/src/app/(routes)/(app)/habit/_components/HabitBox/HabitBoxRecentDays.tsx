import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { CheckIcon } from '@/common/constants/appIcons';
import { cn } from '@/common/utils/cn';
import { format, parseISO, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  name: string;
  iconColor: string;
  startedDate: string;
  recentDateStatus: boolean[];
  todayString: string;
  controlsDisabled: boolean;
  onToggleHabit: (checked: boolean, dateString: string) => Promise<void>;
}

const HabitBoxRecentDays = ({
  name,
  iconColor,
  startedDate,
  recentDateStatus,
  todayString,
  controlsDisabled,
  onToggleHabit,
}: Props) => {
  const today = parseISO(todayString);
  const recentDateArray = Array.from({ length: 4 }, (_, index) =>
    subDays(today, index),
  );

  return (
    <div className="grid grid-cols-[repeat(4,max-content)] justify-around">
      {recentDateArray.map((date, i) => {
        const checked = recentDateStatus[i];
        const dateString = format(date, 'yyyy-MM-dd');
        const disabled = controlsDisabled || dateString < startedDate;
        return (
          <label
            key={dateString}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1 text-sm text-theme-text-secondary',
              disabled && 'opacity-40',
            )}
          >
            <span className={i === 0 ? 'text-theme-accent' : undefined}>
              {i === 0 ? '오늘' : format(date, 'eee', { locale: ko })}
            </span>
            <span>{format(date, 'd')}</span>
            <input
              className="peer sr-only"
              type="checkbox"
              aria-label={`${name} ${format(date, 'M월 d일')} 완료`}
              checked={checked}
              disabled={disabled}
              onChange={(event) =>
                onToggleHabit(event.currentTarget.checked, dateString)
              }
            />
            <span
              style={{
                borderColor: `color-mix(in srgb, ${resolveHabitIconColor(iconColor)} ${checked ? 75 : 60}%, transparent)`,
                ...(checked
                  ? {
                      backgroundColor: `color-mix(in srgb, ${resolveHabitIconColor(iconColor)} 75%, transparent)`,
                    }
                  : {}),
              }}
              className={cn(
                'mt-1 flex h-5 w-5 items-center justify-center rounded-md border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-theme-accent transition-colors duration-150 motion-reduce:transition-none',
                checked
                  ? 'border-theme-accent/75 bg-theme-accent/75 text-theme-text-on-accent'
                  : 'border-theme-text-disabled/60 bg-theme-surface',
              )}
            >
              <CheckIcon
                className={cn(
                  'h-3.5 w-3.5 transition-opacity motion-reduce:transition-none',
                  checked ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default HabitBoxRecentDays;

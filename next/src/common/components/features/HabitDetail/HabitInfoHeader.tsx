
import ScrollableName from '@/common/components/ui/ScrollableName';
import { useItemAccent } from '@/common/hooks/useItemAccent';
import type { HabitData } from '@/common/actions/habit/types';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitIcon from '@/common/components/ui/HabitIcon';

interface Props {
  habitData?: Pick<HabitData, 'name' | 'priority' | 'iconKey' | 'iconColor'>;
}

const HabitInfoHeader = ({ habitData }: Props) => {
  const accent = useItemAccent(habitData?.iconColor);
  return (
    <header className="flex w-full min-w-0 flex-col items-center gap-4 px-1 py-2">
      <div className="flex w-full flex-col min-w-0 justify-center items-center gap-4">
        <HabitIcon iconKey={habitData?.iconKey} iconColor={habitData?.iconColor} className="shrink-0 text-[4rem]" />
        <h1 className="m-0 w-full min-w-0 text-center text-xl font-semibold leading-tight text-theme-text-primary"><ScrollableName name={habitData?.name ?? '-'} /></h1>
      </div>
      {habitData && (
        <div className="flex flex-col flex-wrap items-center gap-x-5 gap-y-2 text-sm text-theme-text-secondary">
          <span className="flex items-center gap-2" style={{ color: accent.color }}>
            <HabitPriority priority={habitData.priority} color={accent.color} className="gap-0.5 text-base" />
          </span>
          <span>{habitData.priority === 0 ? '자유 기록' : '매일 기록'}</span>
        </div>
      )}
    </header>
  );
};

export default HabitInfoHeader;


import type { HabitData } from '@/common/actions/habit/types';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitIcon from '@/common/components/ui/HabitIcon';
import ScrollableName from '@/common/components/ui/ScrollableName';
import { useItemAccent } from '@/common/hooks/useItemAccent';

interface Props {
  habitData?: Pick<HabitData, 'name' | 'description' | 'priority' | 'iconKey' | 'iconColor'>;
}

const HabitInfoHeader = ({ habitData }: Props) => {
  const accent = useItemAccent(habitData?.iconColor);
  return (
    <header className="flex w-full min-w-0 flex-col items-center gap-3">
      <HabitIcon iconKey={habitData?.iconKey} iconColor={habitData?.iconColor} className="shrink-0 text-[4rem]" />
      <HabitPriority priority={habitData?.priority ?? 0} color={accent.color} className="gap-0.5 text-lg" />
      <h1 className="m-0 w-[90%] min-w-0 text-center text-xl font-semibold leading-tight text-theme-text-primary"><ScrollableName name={habitData?.name ?? '-'} /></h1>
    </header>
  );
};

export default HabitInfoHeader;

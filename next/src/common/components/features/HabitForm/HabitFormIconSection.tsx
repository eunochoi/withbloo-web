import HabitIcon from '@/common/components/ui/HabitIcon';
import { HABIT_ICON_LABELS } from '@/common/constants/habitIconLabels';
import type { HabitIconKey } from '@/common/constants/habitIcons';
import HabitFormPickerRow from './HabitFormPickerRow';

const HabitFormIconSection = ({ iconKey, iconColor, onOpen }: { iconKey: HabitIconKey; iconColor: string; onOpen: () => void }) => (
  <section aria-labelledby="habit-icon-title" className="flex flex-col gap-3">
    <h2 id="habit-icon-title" className="text-lg font-semibold">아이콘</h2>
    <HabitFormPickerRow accessibilityLabel="아이콘 선택" label={HABIT_ICON_LABELS[iconKey]}
      leading={<HabitIcon iconKey={iconKey} iconColor={iconColor} className="shrink-0 text-3xl" />} onClick={onOpen} />
  </section>
);

export default HabitFormIconSection;

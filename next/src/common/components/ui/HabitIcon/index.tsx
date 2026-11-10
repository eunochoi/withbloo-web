import { getHabitIconKey, HABIT_ICONS } from '@/common/constants/habitIcons';
import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { cn } from '@/common/utils/cn';

interface HabitIconProps {
  iconKey?: string | null;
  className?: string;
  iconColor?: string | null;
  colorOverride?: string;
}

const HabitIcon = ({ iconKey, iconColor, colorOverride, className }: HabitIconProps) => {
  const Icon = HABIT_ICONS[getHabitIconKey(iconKey)];

  return (
    <Icon
      className={cn('text-theme-accent', className)}
      style={{ color: colorOverride ?? resolveHabitIconColor(iconColor) }}
      aria-hidden="true"
      focusable="false"
    />
  );
};

export default HabitIcon;

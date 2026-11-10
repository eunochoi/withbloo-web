import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { SOBER_ICONS } from '@/common/constants/sober';

export const SoberIcon = ({
  name,
  color,
  className = 'h-10 w-10',
  colorOverride,
}: {
  name: string;
  color: string;
  className?: string;
  colorOverride?: string;
}) => {
  const key = Object.hasOwn(SOBER_ICONS, name) ? name : 'favorite';
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      style={{
        backgroundColor: colorOverride ?? resolveHabitIconColor(color),
        maskImage: `url('/img/sober/sober-${key}.png')`,
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
      }}
    />
  );
};

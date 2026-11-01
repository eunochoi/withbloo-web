import { HABIT_ICON_COLORS, getHabitIconColor } from '@/common/constants/habitIconColors';
import { THEME_VALUE } from '@/common/types/theme';
import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { itemAccentColors } from '@/common/functions/itemAccentColors';

export function useItemAccent(iconColor: string | undefined) {
  const { theme } = useSettingsContext();
  const key = getHabitIconColor(iconColor);
  const color = key === 'theme' ? '#' + THEME_VALUE[theme.accent].accent.split(' ').map((channel) => Number(channel).toString(16).padStart(2, '0')).join('') : HABIT_ICON_COLORS[key].value;
  return itemAccentColors(color, theme.mode === '어둡게' ? '#262626' : '#ffffff', theme.mode === '어둡게' ? 'dark' : 'light');
}

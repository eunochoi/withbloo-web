import { DEFAULT_HABIT_PRIORITY } from '@/common/constants/habit';
import { DEFAULT_HABIT_ICON_KEY, type HabitIconKey } from '@/common/constants/habitIcons';
import { format } from 'date-fns';
import { DEFAULT_HABIT_ICON_COLOR, type HabitIconColorKey } from '@/common/constants/habitIconColors';
import { useState } from 'react';

export const useHabitForm = () => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(DEFAULT_HABIT_PRIORITY);
  const [iconKey, setIconKey] = useState<HabitIconKey>(DEFAULT_HABIT_ICON_KEY);

  const [iconColor, setIconColor] = useState<HabitIconColorKey>(DEFAULT_HABIT_ICON_COLOR);
  const [startedAtInput, setStartedAtInput] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  return {
    iconColor,
    setIconColor,
    startedAtInput,
    setStartedAtInput,
    name,
    setName,
    priority,
    setPriority,
    iconKey,
    setIconKey,
  };
};

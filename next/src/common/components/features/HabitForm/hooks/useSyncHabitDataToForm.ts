import { DEFAULT_HABIT_PRIORITY } from '@/common/constants/habit';
import { getHabitIconKey, type HabitIconKey } from '@/common/constants/habitIcons';
import type { HabitData } from '@/common/actions/habit';
import { format } from 'date-fns';
import { getHabitIconColor, type HabitIconColorKey } from '@/common/constants/habitIconColors';
import { useEffect, useRef, useState } from 'react';

type UseSyncHabitDataToFormParams = {
  enabled: boolean;
  habitData: HabitData | undefined;
  setName: (value: string) => void;
  setPriority: (value: number) => void;
  setIconKey: (value: HabitIconKey) => void;
  setIconColor: (value: HabitIconColorKey) => void;
  setStartedAtInput: (value: string) => void;
};

export const useSyncHabitDataToForm = ({
  enabled,
  habitData,
  setName,
  setPriority,
  setIconKey,
  setIconColor,
  setStartedAtInput,
}: UseSyncHabitDataToFormParams) => {
  const initializedHabitIdRef = useRef<number | null>(null);
  const [initializedHabitId, setInitializedHabitId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!enabled || !habitData) return;
    if (initializedHabitIdRef.current === habitData.id) return;

    setName(habitData.name ?? '');
    setPriority(habitData.priority ?? DEFAULT_HABIT_PRIORITY);
    setIconKey(getHabitIconKey(habitData.iconKey));
    setIconColor(getHabitIconColor(habitData.iconColor));
    setStartedAtInput(format(new Date(habitData.initialStartedAt), "yyyy-MM-dd'T'HH:mm"));
    initializedHabitIdRef.current = habitData.id;
    setInitializedHabitId(habitData.id);
  }, [enabled, habitData, setName, setPriority, setIconKey, setIconColor, setStartedAtInput]);

  return !enabled || initializedHabitId === habitData?.id;
};

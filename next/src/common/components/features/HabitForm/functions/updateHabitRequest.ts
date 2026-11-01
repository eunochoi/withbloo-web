import { updateHabit } from '@/common/actions/habit';
import { authAction } from '@/common/auth/authAction';
import type { HabitData } from '@/common/actions/habit';
import type { HabitIconKey } from '@/common/constants/habitIcons';

type UpdateHabitRequestParams = {
  habitId: string;
  name: string;
  priority: number;
  iconKey: HabitIconKey;
  iconColor: string;
};

export const updateHabitRequest = async ({
  habitId,
  name,
  priority,
  iconKey,
  iconColor,
}: UpdateHabitRequestParams): Promise<HabitData> =>
  authAction(() =>
    updateHabit({
      habitId,
      habitName: name,
      priority,
      iconKey,
      iconColor,
    }),
  );

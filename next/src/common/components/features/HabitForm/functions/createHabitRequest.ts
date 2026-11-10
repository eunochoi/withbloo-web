import { createHabit } from '@/common/actions/habit';
import { authAction } from '@/common/auth/authAction';
import type { HabitData } from '@/common/actions/habit';
import type { HabitIconKey } from '@/common/constants/habitIcons';

type CreateHabitRequestParams = {
  name: string;
  description: string;
  priority: number;
  iconKey: HabitIconKey;
  iconColor: string;
  initialStartedAt: string;
};

export const createHabitRequest = async ({
  name,
  description,
  priority,
  iconKey,
  iconColor,
  initialStartedAt,
}: CreateHabitRequestParams): Promise<HabitData> =>
  authAction(() =>
    createHabit({
      habitName: name,
      description,
      priority,
      iconKey,
      iconColor,
      initialStartedAt,
    }),
  );

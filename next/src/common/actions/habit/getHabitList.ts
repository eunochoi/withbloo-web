'use server';

import { getUserTimezone } from '../../utils/date/userTimezone';

import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { HabitData } from './types';
import { createAuthErrorResult, createServerErrorResult, formatHabitData } from './utils';
import { getSortedHabits } from './utils/getSortedHabits';

export const getHabitList = async (): Promise<ActionResult<HabitData[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    const timezone = await getUserTimezone();

    const habits = await getSortedHabits(auth.email);

    return { ok: true, data: habits.map((habit) => formatHabitData(habit, timezone)) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

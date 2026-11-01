'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { getHabitDaySummary } from '../../functions/habitStats';
import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import type { TodayHabitStat } from './types';
import { createAuthErrorResult, createServerErrorResult } from './utils';

export const getTodayHabitStat = async (): Promise<ActionResult<TodayHabitStat>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const timezone = await getUserTimezone();
    const todayDate = formatDateInTimezone(new Date(), timezone);
    const [habits, records] = await Promise.all([
      prisma.habit.findMany({ where: { userId: auth.userId }, select: { id: true, priority: true, initialStartedAt: true } }),
      prisma.habitCompletion.findMany({
        where: { habit: { userId: auth.userId }, date: todayDate }, select: { habitId: true },
      }),
    ]);

    const summary = getHabitDaySummary(todayDate, habits.map((habit) => ({
      ...habit, startedDate: formatDateInTimezone(habit.initialStartedAt, timezone),
    })), new Set(records.map((record) => record.habitId)));

    return {
      ok: true,
      data: {
        createdHabits: summary.total,
        todayDoneHabits: summary.completed,
        excludedCompleted: summary.excludedCompleted,
      },
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

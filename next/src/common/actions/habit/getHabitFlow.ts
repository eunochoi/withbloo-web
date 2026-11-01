'use server';

import { getHabitDaySummary } from '../../functions/habitStats';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { addDaysToDateString, formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import { createAuthErrorResult, createServerErrorResult, validateDateFormat } from './utils';

export const getHabitFlow = async ({ date }: { date: string }): Promise<ActionResult<{ date: string; completed: number; total: number; excludedCompleted: number }[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    if (!validateDateFormat(date)) return { ok: false, code: 'INVALID_DATE', message: '날짜 형식이 올바르지 않습니다.' };
    const start = addDaysToDateString(date, -13);
    const [habits, records, timezone] = await Promise.all([
      prisma.habit.findMany({ where: { userId: auth.userId }, select: { id: true, initialStartedAt: true, priority: true } }),
      prisma.habitCompletion.findMany({ where: { habit: { userId: auth.userId }, date: { gte: start, lte: date } }, select: { date: true, habitId: true } }),
      getUserTimezone(),
    ]);
    if (date > formatDateInTimezone(new Date(), timezone)) {
      return { ok: false, code: 'FUTURE_HABIT_DATE', message: '미래 날짜의 습관 흐름은 조회할 수 없습니다.' };
    }
    const startedHabits = habits.map((habit) => ({ id: habit.id, priority: habit.priority, startedDate: formatDateInTimezone(habit.initialStartedAt, timezone) }));
    return {
      ok: true,
      data: Array.from({ length: 14 }, (_, index) => {
        const day = addDaysToDateString(start, index);
        const completedIds = new Set(records.filter((record) => record.date === day).map((record) => record.habitId));
        return { date: day, ...getHabitDaySummary(day, startedHabits, completedIds) };
      }),
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

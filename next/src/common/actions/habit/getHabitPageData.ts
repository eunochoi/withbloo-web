'use server';

import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { addDaysToDateString } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import type { HabitPageData } from './types';
import { createAuthErrorResult, createServerErrorResult, formatHabitData, validateDateFormat } from './utils';
import { getSortedHabits } from './utils/getSortedHabits';

export const getHabitPageData = async (params: { date: string }): Promise<ActionResult<HabitPageData[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    const timezone = await getUserTimezone();
    if (!validateDateFormat(params.date)) {
      return { ok: false, code: 'INVALID_DATE', message: '날짜 형식이 올바르지 않습니다. (yyyy-MM-dd)' };
    }

    const habits = await getSortedHabits(auth.email);
    if (habits.length === 0) return { ok: true, data: [] };

    const recentDates = Array.from({ length: 4 }, (_, index) => addDaysToDateString(params.date, -index));
    const habitIds = habits.map((habit) => habit.id);
    const records = await prisma.habitCompletion.findMany({
      where: { habitId: { in: habitIds }, habit: { userId: auth.userId }, date: { gte: recentDates[3], lte: params.date } },
      select: { habitId: true, date: true },
    });
    const checkedDates = new Map<number, Set<string>>();
    for (const record of records) {
      if (!checkedDates.has(record.habitId)) checkedDates.set(record.habitId, new Set());
      checkedDates.get(record.habitId)!.add(record.date);
    }

    return {
      ok: true,
      data: habits.map((habit) => ({
        ...formatHabitData(habit, timezone),
        recentDateStatus: recentDates.map((date) => date >= formatDateInTimezone(habit.initialStartedAt, timezone) && (checkedDates.get(habit.id)?.has(date) ?? false)),
      })),
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

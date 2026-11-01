'use server';

import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { HabitCount, HabitStats, YearParams } from './types';
import { createAuthErrorResult, createServerErrorResult, getYearRange } from './utils';

export const getHabitStats = async ({ year }: YearParams): Promise<ActionResult<HabitStats>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const { startDate, endDate } = getYearRange(year);
    const timezone = await getUserTimezone();
    const today = formatDateInTimezone(new Date(), timezone);
    const [allHabits, records] = await Promise.all([
      prisma.habit.findMany({
        where: { email: auth.email, priority: { gt: 0 } },
        select: {
          id: true,
          name: true,
          priority: true,
          iconKey: true,
          iconColor: true,
          initialStartedAt: true,
        },
      }),
      prisma.habitCompletion.findMany({
        where: { habit: { userId: auth.userId }, date: { gte: startDate, lte: endDate } },
        select: { habitId: true, date: true },
      }),
    ]);

    const startedDates = new Map(allHabits.map((habit) => [habit.id, formatDateInTimezone(habit.initialStartedAt, timezone)]));
    const habitCounts: Record<number, HabitCount> = {};
    allHabits.forEach((habit) => {
      habitCounts[habit.id] = {
        id: habit.id,
        name: habit.name,
        priority: habit.priority,
        iconKey: habit.iconKey,
        iconColor: habit.iconColor,
        count: 0,
      };
    });

    records.forEach((record) => {
      if (habitCounts[record.habitId] && record.date >= startedDates.get(record.habitId)! && record.date <= today) habitCounts[record.habitId].count += 1;
    });

    const sortedHabits = Object.values(habitCounts)
      .filter((habit) => habit.count > 0)
      .sort((a, b) => b.count - a.count);
    const topHabits = sortedHabits.slice(0, 5);
    const bottomHabits = sortedHabits.length > 5
      ? sortedHabits.slice(-5).reverse()
      : sortedHabits.slice().reverse();

    return {
      ok: true,
      data: {
        topHabits,
        bottomHabits,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_YEAR') {
      return { ok: false, code: 'INVALID_YEAR', message: 'year는 1900~2100 사이의 유효한 연도여야 합니다.' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

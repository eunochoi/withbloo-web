'use server';

import { differenceInCalendarDays } from 'date-fns';
import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import { parseLocalDate } from '../../utils/date/parseLocalDate';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { HabitYearParams } from './types';
import { createAuthErrorResult, createServerErrorResult, getYearRange, parseHabitId } from './utils';

export const getHabitYearlyStatus = async ({ id, year }: HabitYearParams): Promise<ActionResult<{ monthly: number[]; completed: number; missed: number | null; rate: number | null }>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const habitId = parseHabitId(id);
    if (!habitId) {
      return { ok: false, code: 'INVALID_HABIT_ID', message: 'id는 필수입니다.' };
    }

    const { startDate, endDate } = getYearRange(year);
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: auth.userId }, select: { initialStartedAt: true, priority: true } });
    if (!habit) return { ok: false, code: 'HABIT_NOT_FOUND', message: '습관을 찾을 수 없습니다.' };
    const timezone = await getUserTimezone();
    const today = formatDateInTimezone(new Date(), timezone);
    const startedDate = formatDateInTimezone(habit.initialStartedAt, timezone);
    const targetStart = startedDate > startDate ? startedDate : startDate;
    const targetEnd = today < endDate ? today : endDate;
    const targetDays = targetStart <= targetEnd ? differenceInCalendarDays(parseLocalDate(targetEnd), parseLocalDate(targetStart)) + 1 : 0;
    const diaries = await prisma.habitCompletion.findMany({
      where: {
        habit: { userId: auth.userId },
        date: {
          gte: startDate,
          lte: endDate,
        },
        habitId,
      },
      select: { date: true },
    });

    const result = Array(12).fill(0);
    const eligible = diaries.filter((diary) => diary.date >= targetStart && diary.date <= targetEnd);
    eligible.forEach((diary) => {
      const month = parseInt(diary.date.split('-')[1], 10) - 1;
      result[month] += 1;
    });

    const completed = eligible.length;
    return { ok: true, data: { monthly: result, completed, missed: habit.priority === 0 ? null : Math.max(0, targetDays - completed), rate: habit.priority > 0 && targetDays ? Number((completed / targetDays * 100).toFixed(1)) : null } };
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_YEAR') {
      return { ok: false, code: 'INVALID_YEAR', message: '연도 형식이 올바르지 않습니다. (1900-2100)' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { HabitMonthData } from '../../types/calendar';
import { getMonthRange } from '../../utils/date/getMonthRange';
import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import { createAuthErrorResult, createServerErrorResult } from './utils';
import { getHabitDateWindow } from './utils/datePolicy';
import { getHabitMonthSummary } from './utils/getHabitMonthSummary';

export const getHabitMonthData = async ({ id, month }: {
  id: string;
  month: string;
}): Promise<ActionResult<HabitMonthData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const habitId = Number(id);
    if (!Number.isSafeInteger(habitId) || habitId <= 0) {
      return { ok: false, code: 'INVALID_HABIT_ID', message: '올바른 습관을 지정해주세요.' };
    }
    const range = getMonthRange(month);
    if (!range) {
      return { ok: false, code: 'INVALID_MONTH', message: '올바른 월을 지정해주세요. (yyyy-MM)' };
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: auth.userId },
      select: { initialStartedAt: true, priority: true },
    });
    if (!habit) {
      return { ok: false, code: 'HABIT_NOT_FOUND', message: '습관을 찾을 수 없습니다.' };
    }

    const timezone = await getUserTimezone();
    const today = formatDateInTimezone(new Date(), timezone);
    const startedDate = formatDateInTimezone(habit.initialStartedAt, timezone);
    const { editableFrom } = getHabitDateWindow(today);

    const records = await prisma.habitCompletion.findMany({
      where: {
        habit: { userId: auth.userId },
        date: { gte: range.startDate, lte: range.endDate },
        habitId,
      },
      select: { date: true },
    });

    const daysByDate: HabitMonthData['daysByDate'] = {};
    for (const record of records) {
      // 시작일 이전의 기존 기록도 표시하되 통계에서는 제외한다.
      daysByDate[record.date] = true;
    }

    return {
      ok: true,
      data: {
        month,
        today,
        startedDate,
        editableFrom,
        daysByDate,
        summary: getHabitMonthSummary({
          monthStart: range.startDate,
          monthEnd: range.endDate,
          startedDate,
          today,
          completedDates: records.map(({ date }) => date),
          isFree: habit.priority === 0,
        }),
      },
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

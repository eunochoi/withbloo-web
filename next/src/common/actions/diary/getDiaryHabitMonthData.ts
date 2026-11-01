'use server';

import { getHabitDaySummary } from '../../functions/habitStats';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { DiaryHabitMonthData } from '../../types/calendar';
import { getMonthRange } from '../../utils/date/getMonthRange';
import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import { createAuthErrorResult, createServerErrorResult } from './utils';

export const getDiaryHabitMonthData = async ({ month }: {
  month: string;
}): Promise<ActionResult<DiaryHabitMonthData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const range = getMonthRange(month);
    if (!range) {
      return { ok: false, code: 'INVALID_MONTH', message: '올바른 월을 지정해주세요. (yyyy-MM)' };
    }

    const timezone = await getUserTimezone();
    const [diaries, habits, records] = await Promise.all([prisma.diary.findMany({
      where: {
        userId: auth.userId,
        date: { gte: range.startDate, lte: range.endDate },
      },
      select: {
        date: true,
        emotion: true,
        createdAt: true,
      },
    }), prisma.habit.findMany({
      where: { userId: auth.userId },
      select: { id: true, initialStartedAt: true, priority: true },
    }), prisma.habitCompletion.findMany({
      where: { habit: { userId: auth.userId }, date: { gte: range.startDate, lte: range.endDate } },
      select: { habitId: true, date: true },
    })]);
    const eligibleHabits = habits.map((habit) => ({ id: habit.id, priority: habit.priority, startedDate: formatDateInTimezone(habit.initialStartedAt, timezone) }));

    const daysByDate: DiaryHabitMonthData['daysByDate'] = {};
    let diaryCount = 0;
    let completedHabitCount = 0;

    const diaryByDate = new Map(diaries.map((diary) => [diary.date, diary]));
    const completedByDate = new Map<string, Set<number>>();
    for (const record of records) {
      if (!completedByDate.has(record.date)) completedByDate.set(record.date, new Set());
      completedByDate.get(record.date)!.add(record.habitId);
    }
    const dates = new Set([...Array.from(diaryByDate.keys()), ...Array.from(completedByDate.keys())]);
    for (const date of Array.from(dates)) {
      const diary = diaryByDate.get(date);
      const completedIds = completedByDate.get(date) ?? new Set<number>();
      const summary = getHabitDaySummary(date, eligibleHabits, completedIds);
      daysByDate[date] = {
        hasDiary: !!diary,
        emotion: diary?.emotion ?? null,
        diaryCreatedAt: diary?.createdAt.getTime() ?? null,
        completedHabitCount: completedIds.size,
        countedHabitCount: summary.completed,
        totalHabitCount: summary.total,
      };
      if (diary) diaryCount += 1;
      completedHabitCount += completedIds.size;
    }

    return {
      ok: true,
      data: { month, daysByDate, summary: { diaryCount, completedHabitCount } },
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

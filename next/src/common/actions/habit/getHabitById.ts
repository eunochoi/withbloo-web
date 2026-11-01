'use server';

import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { HabitData, IdParams } from './types';
import { createAuthErrorResult, createServerErrorResult, formatHabitData, parseHabitId } from './utils';

export const getHabitById = async ({ id }: IdParams): Promise<ActionResult<HabitData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    const timezone = await getUserTimezone();

    const habitId = parseHabitId(id);
    if (!habitId) {
      return { ok: false, code: 'INVALID_HABIT_ID', message: 'id는 필수입니다.' };
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, email: auth.email },
    });

    if (!habit) {
      return { ok: false, code: 'HABIT_NOT_FOUND', message: '습관을 찾을 수 없습니다.' };
    }

    const startedDate = formatDateInTimezone(habit.initialStartedAt, timezone);
    const today = formatDateInTimezone(new Date(), timezone);
    const latest = habit.priority === 0 ? await prisma.habitCompletion.findFirst({
      where: { habit: { userId: auth.userId }, habitId: habit.id, date: { gte: startedDate, lte: today } },
      orderBy: { date: 'desc' },
      select: { date: true },
    }) : null;
    return { ok: true, data: { ...formatHabitData(habit, timezone), latestRecordedDate: latest?.date ?? null } };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

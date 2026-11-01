'use server';

import { getHabitDaySummary } from '../../functions/habitStats';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import type { ActionResult } from '../types';
import type { HabitsByDate, HabitsByDateParams } from './types';
import { createAuthErrorResult, createServerErrorResult, validateDateFormat } from './utils';
import { getHabitDateAccess } from './utils/datePolicy';

export const getHabitsByDate = async ({ date }: HabitsByDateParams): Promise<ActionResult<HabitsByDate>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    if (!validateDateFormat(date)) {
      return { ok: false, code: 'INVALID_DATE', message: '날짜 형식이 올바르지 않습니다. (yyyy-MM-dd)' };
    }

    const { canEdit, isFuture } = await getHabitDateAccess(date);
    if (isFuture) {
      return { ok: true, data: { habits: [], summary: { total: 0, completed: 0, excludedCompleted: 0 }, canEdit: false, isFuture: true } };
    }

    const records = await prisma.habitCompletion.findMany({
      where: { habit: { userId: auth.userId }, date },
      include: { habit: true }, orderBy: [{ habit: { priority: 'desc' } }, { habit: { createdAt: 'asc' } }],
    });
    const completedHabits = records.map((record) => record.habit);

    const [timezone, habits] = await Promise.all([
      getUserTimezone(),
      prisma.habit.findMany({
        where: { email: auth.email },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, name: true, priority: true, iconKey: true, iconColor: true, initialStartedAt: true },
      }),
    ]);
    const completedHabitIds = new Set(completedHabits.map((habit) => habit.id));

    const summary = getHabitDaySummary(date, habits.map((habit) => ({
      ...habit, startedDate: formatDateInTimezone(habit.initialStartedAt, timezone),
    })), completedHabitIds);

    if (!canEdit) {
      return {
        ok: true,
        data: {
          summary,
          habits: completedHabits.map((habit) => ({ ...habit, completed: true, canEdit: false })),
          canEdit: false,
          isFuture: false,
        },
      };
    }

    return {
      ok: true,
      data: {
        summary,
        habits: habits
          .filter((habit) => completedHabitIds.has(habit.id) || formatDateInTimezone(habit.initialStartedAt, timezone) <= date)
          .map((habit) => ({
            id: habit.id,
            name: habit.name,
            priority: habit.priority,
            iconKey: habit.iconKey,
            iconColor: habit.iconColor,
            canEdit: formatDateInTimezone(habit.initialStartedAt, timezone) <= date,
            completed: completedHabitIds.has(habit.id),
          })),
        canEdit: true,
        isFuture: false,
      },
    };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

'use server';

import { formatDateInTimezone, getUserTimezone } from '../../utils/date/userTimezone';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { CheckHabitParams } from './types';
import { createAuthErrorResult, createServerErrorResult, validateDateFormat } from './utils';
import { getHabitDateAccess } from './utils/datePolicy';

export const uncheckHabit = async ({ habitId, date }: CheckHabitParams): Promise<ActionResult<string>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    if (!Number.isSafeInteger(habitId) || habitId <= 0 || date == null) {
      return { ok: false, code: 'INVALID_HABIT_CHECK_INPUT', message: 'habitId와 date는 필수입니다.' };
    }
    if (!validateDateFormat(date)) {
      return { ok: false, code: 'INVALID_DATE', message: '날짜 형식이 올바르지 않습니다. (yyyy-MM-dd)' };
    }
    const timezone = await getUserTimezone();
    const today = formatDateInTimezone(new Date(), timezone);
    const { canEdit, isFuture } = await getHabitDateAccess(date, { today });
    if (!canEdit) {
      return {
        ok: false,
        code: isFuture ? 'FUTURE_HABIT_DATE' : 'HABIT_DATE_NOT_EDITABLE',
        message: isFuture
          ? '미래 날짜의 습관은 체크할 수 없습니다.'
          : '습관은 오늘을 포함한 최근 4일만 변경할 수 있습니다.',
      };
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: auth.email },
        select: { id: true },
      });
      if (!user) throw new Error('USER_NOT_FOUND');

      const habit = await tx.habit.findFirst({
        where: { email: auth.email, id: habitId },
        select: { id: true, initialStartedAt: true },
      });
      if (!habit) throw new Error('HABIT_NOT_FOUND');
      if (date < formatDateInTimezone(habit.initialStartedAt, timezone)) throw new Error('HABIT_DATE_BEFORE_START');

      await tx.habitCompletion.deleteMany({ where: { habitId: habit.id, date } });
    });

    return { ok: true, data: 'unchecked' };
  } catch (error) {
    if (error instanceof Error && error.message === 'HABIT_DATE_BEFORE_START') {
      return { ok: false, code: 'HABIT_DATE_BEFORE_START', message: '습관 시작일 이전에는 기록을 변경할 수 없습니다.' };
    }
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저 정보가 존재하지 않습니다.' };
    }
    if (error instanceof Error && error.message === 'HABIT_NOT_FOUND') {
      return { ok: false, code: 'HABIT_NOT_FOUND', message: '습관이 존재하지 않습니다.' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

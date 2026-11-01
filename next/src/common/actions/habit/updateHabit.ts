'use server';

import { isHabitIconColor } from '../../constants/habitIconColors';
import { isValidHabitStartedAt } from '../../functions/habitStats';
import { getUserTimezone } from '../../utils/date/userTimezone';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { isValidHabitIconKey } from '../../constants/habitIcons';
import {
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
} from '../../constants/habit';
import type { ActionResult } from '../types';
import type { HabitData, HabitFormParams } from './types';
import {
  createAuthErrorResult,
  createServerErrorResult,
  formatHabitData,
  isValidHabitName,
  isValidHabitPriority,
  parseHabitId,
} from './utils';

export const updateHabit = async ({ habitId, habitName, priority, iconKey, iconColor, initialStartedAt }: HabitFormParams): Promise<ActionResult<HabitData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    const timezone = await getUserTimezone();

    const parsedHabitId = parseHabitId(habitId);
    if (!parsedHabitId) {
      return { ok: false, code: 'INVALID_HABIT_ID', message: 'habitId는 필수입니다.' };
    }
    if (!isValidHabitName(habitName)) {
      return { ok: false, code: 'INVALID_HABIT_NAME', message: `습관 이름은 ${HABIT_NAME_MIN_LENGTH}~${HABIT_NAME_MAX_LENGTH}자로 입력해주세요.` };
    }
    if (!isValidHabitPriority(priority)) {
      return { ok: false, code: 'INVALID_HABIT_PRIORITY', message: '습관 우선순위가 올바르지 않습니다.' };
    }
    if (iconColor !== undefined && !isHabitIconColor(iconColor)) {
      return { ok: false, code: 'INVALID_HABIT_COLOR', message: '아이콘 색상을 다시 선택해주세요.' };
    }
    if (initialStartedAt !== undefined && !isValidHabitStartedAt(initialStartedAt)) {
      return { ok: false, code: 'INVALID_HABIT_START', message: '시작 일시는 1900년 이후의 현재 또는 과거 시각으로 입력해주세요.' };
    }
    const normalizedHabitName = habitName.trim();
    if (iconKey !== undefined && !isValidHabitIconKey(iconKey)) {
      return { ok: false, code: 'INVALID_HABIT_ICON', message: '습관 아이콘을 다시 선택해주세요.' };
    }

    const habit = await prisma.habit.findFirst({
      where: { id: parsedHabitId, email: auth.email },
    });

    if (!habit) {
      return { ok: false, code: 'HABIT_NOT_FOUND', message: '습관이 존재하지 않습니다.' };
    }

    if (initialStartedAt !== undefined && initialStartedAt !== habit.initialStartedAt.toISOString()) {
      return { ok: false, code: 'HABIT_START_IMMUTABLE', message: '시작 일시는 저장 후 변경할 수 없어요.' };
    }

    const duplicateName = await prisma.habit.findFirst({
      where: {
        email: auth.email,
        name: normalizedHabitName,
        id: { not: parsedHabitId },
      },
    });

    if (duplicateName) {
      return { ok: false, code: 'DUPLICATE_HABIT_NAME', message: '동일한 이름의 습관이 존재합니다.' };
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habit.id },
      data: {
        name: normalizedHabitName,
        priority,
        ...(iconKey !== undefined ? { iconKey } : {}),
        ...(iconColor !== undefined ? { iconColor } : {}),
      },
    });

    return { ok: true, data: formatHabitData(updatedHabit, timezone) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

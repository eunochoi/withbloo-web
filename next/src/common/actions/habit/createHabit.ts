'use server';

import { DEFAULT_HABIT_ICON_COLOR, isHabitIconColor } from '../../constants/habitIconColors';
import { isValidHabitStartedAt } from '../../functions/habitStats';
import { getUserTimezone } from '../../utils/date/userTimezone';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { DEFAULT_HABIT_ICON_KEY, isValidHabitIconKey } from '../../constants/habitIcons';
import {
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
  MAX_HABIT_COUNT,
} from '../../constants/habit';
import type { ActionResult } from '../types';
import type { HabitData, HabitFormParams } from './types';
import {
  createAuthErrorResult,
  createServerErrorResult,
  formatHabitData,
  isValidHabitName,
  isValidHabitPriority,
} from './utils';

export const createHabit = async ({ habitName, priority, iconKey = DEFAULT_HABIT_ICON_KEY, iconColor = DEFAULT_HABIT_ICON_COLOR, initialStartedAt }: HabitFormParams): Promise<ActionResult<HabitData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);
    const timezone = await getUserTimezone();

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
    if (!isValidHabitIconKey(iconKey)) {
      return { ok: false, code: 'INVALID_HABIT_ICON', message: '습관 아이콘을 다시 선택해주세요.' };
    }

    const user = await prisma.user.findUnique({
      where: { email: auth.email },
      select: { id: true },
    });

    if (!user) {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저가 존재하지 않습니다.' };
    }

    const existingHabit = await prisma.habit.findFirst({
      where: { userId: user.id, name: normalizedHabitName },
    });

    if (existingHabit) {
      return { ok: false, code: 'DUPLICATE_HABIT_NAME', message: '같은 이름을 가진 습관이 이미 존재합니다.' };
    }

    const habitCount = await prisma.habit.count({
      where: { userId: user.id },
    });

    if (habitCount >= MAX_HABIT_COUNT) {
      return { ok: false, code: 'HABIT_LIMIT_EXCEEDED', message: `습관은 최대 ${MAX_HABIT_COUNT}개까지 생성 가능합니다.` };
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        email: auth.email,
        name: normalizedHabitName,
        priority,
        iconKey,
        iconColor,
        initialStartedAt: initialStartedAt ? new Date(initialStartedAt) : new Date(),
      },
    });

    return { ok: true, data: formatHabitData(habit, timezone) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

import { getHabitIconColor } from '../../../constants/habitIconColors';
import { formatDateInTimezone } from '../../../utils/date/userTimezone';
import type { Habit } from '@prisma/client';
import { getHabitIconKey } from '../../../constants/habitIcons';

import type { AuthResult } from '../../../auth/getAuth';
import {
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
  HABIT_PRIORITY_MAX,
  HABIT_PRIORITY_MIN,
} from '../../../constants/habit';
import type { ActionResult } from '../../types';
import type { HabitData } from '../types';

export const createAuthErrorResult = (error: Extract<AuthResult, { ok: false }>): ActionResult<never> => {
  return {
    ok: false,
    code: error.code,
    message: error.message,
  };
};

export const createServerErrorResult = (): ActionResult<never> => {
  return {
    ok: false,
    code: 'SERVER_ERROR',
    message: '서버 에러가 발생했습니다.',
  };
};

export const validateDateFormat = (dateString: string | undefined) => {
  if (!dateString || typeof dateString !== 'string') return false;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
};

export const getYearRange = (year: string | number | null | undefined) => {
  const parsedYear = typeof year === 'string' ? Number(year) : year;

  if (!parsedYear || !Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
    throw new Error('INVALID_YEAR');
  }

  return {
    startDate: `${parsedYear}-01-01`,
    endDate: `${parsedYear}-12-31`,
  };
};

export const parseHabitId = (id: string | number | null | undefined) => {
  const habitId = Number(id);

  if (!Number.isSafeInteger(habitId) || habitId <= 0) {
    return null;
  }

  return habitId;
};

export const isValidHabitName = (name: unknown): name is string => {
  return typeof name === 'string'
    && name.trim().length >= HABIT_NAME_MIN_LENGTH
    && name.trim().length <= HABIT_NAME_MAX_LENGTH;
};

export const isValidHabitPriority = (priority: unknown): priority is number => {
  return typeof priority === 'number'
    && Number.isInteger(priority)
    && priority >= HABIT_PRIORITY_MIN
    && priority <= HABIT_PRIORITY_MAX;
};

export const formatHabitData = (habit: Habit, timezone: string): HabitData => {
  return {
    UserId: habit.userId,
    id: habit.id,
    email: habit.email,
    name: habit.name,
    priority: habit.priority,
    iconKey: getHabitIconKey(habit.iconKey),
    iconColor: getHabitIconColor(habit.iconColor),
    initialStartedAt: habit.initialStartedAt.toISOString(),
    startedDate: formatDateInTimezone(habit.initialStartedAt, timezone),
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
};

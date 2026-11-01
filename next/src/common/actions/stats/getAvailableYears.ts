'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import { createAuthErrorResult, createServerErrorResult } from './utils';

export const getAvailableYears = async (): Promise<ActionResult<number[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const [diaries, completions] = await Promise.all([
      prisma.diary.findMany({ where: { userId: auth.userId }, select: { date: true } }),
      prisma.habitCompletion.findMany({ where: { habit: { userId: auth.userId } }, distinct: ['date'], select: { date: true } }),
    ]);
    const years = Array.from(new Set([...diaries, ...completions].map((record) => Number(record.date.slice(0, 4))))).sort((a, b) => b - a);

    return { ok: true, data: years };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

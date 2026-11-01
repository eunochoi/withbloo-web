'use server';

import { EMOTIONS } from '@/common/constants/emotions';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { DiaryStats, YearParams } from './types';
import { createAuthErrorResult, createServerErrorResult, daysToUnits, getOrComputeStreak, getYearRange } from './utils';

export const getDiaryStats = async ({ year }: YearParams): Promise<ActionResult<DiaryStats>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const { startDate, endDate } = getYearRange(year);
    const diaries = await prisma.diary.findMany({
      where: {
        email: auth.email,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        emotion: true,
      },
      orderBy: { date: 'asc' },
    });

    const streak = await getOrComputeStreak(auth.email);
    if (!streak) {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저를 찾을 수 없습니다.' };
    }

    const emotionCounts = Array(EMOTIONS.length).fill(0);
    const monthlyCount = Array(12).fill(0);
    const halfYearEmotionCounts = Array(2).fill(null).map(() => Array(EMOTIONS.length).fill(0));

    diaries.forEach((diary) => {
      if (diary.emotion >= 0 && diary.emotion < EMOTIONS.length) {
        emotionCounts[diary.emotion] += 1;
      }

      const month = parseInt(diary.date.split('-')[1], 10) - 1;
      monthlyCount[month] += 1;
      if (diary.emotion >= 0 && diary.emotion < EMOTIONS.length) {
        const halfYear = Math.floor(month / 6);
        halfYearEmotionCounts[halfYear][diary.emotion] += 1;
      }
    });

    return {
      ok: true,
      data: {
        totalCount: diaries.length,
        emotionCounts,
        currentStreak: daysToUnits(streak.currentStreak),
        longestStreak: daysToUnits(streak.longestStreak),
        hasTodayDiary: streak.hasTodayDiary,
        hasYesterdayDiary: streak.hasYesterdayDiary,
        streakStatus: streak.status,
        monthlyCount,
        halfYearEmotionCounts,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_YEAR') {
      return { ok: false, code: 'INVALID_YEAR', message: 'year는 1900~2100 사이의 유효한 연도여야 합니다.' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

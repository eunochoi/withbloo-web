'use server';

import { EMOTIONS } from '@/common/constants/emotions';
import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import { DIARY_EMOTION_GROUPS, DIARY_SEASONS, type DiaryEmotionGroup, type DiarySeason } from '../../constants/diaryFilters';
import type { ActionResult } from '../types';
import type { DiaryData, DiaryListParams } from './types';
import { createAuthErrorResult, createServerErrorResult, formatDiaryList } from './utils';

export const getDiaryList = async ({
  sortType,
  search,
  pageParam,
  limit,
  selectedYear,
  selectedMonth,
  seasons = [],
  emotionGroups = [],
}: DiaryListParams): Promise<ActionResult<DiaryData[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const page = Math.max(0, Number(pageParam) || 0);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const offset = page * limitNum;
    const nYear = selectedYear === null ? null : Number(selectedYear);
    const nMonth = Number(selectedMonth);

    let rangeStart = '0000-01-01';
    let rangeEnd = '9999-12-31';

    if (nYear !== null && nMonth !== 0) {
      const monthStr = String(nMonth).padStart(2, '0');
      const lastDay = new Date(nYear, nMonth, 0).getDate();
      rangeStart = `${nYear}-${monthStr}-01`;
      rangeEnd = `${nYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    } else if (nYear !== null) {
      rangeStart = `${nYear}-01-01`;
      rangeEnd = `${nYear}-12-31`;
    }

    const emotionFilter = Number(search);
    const validSeasons = seasons.filter((season): season is DiarySeason => Object.hasOwn(DIARY_SEASONS, season));
    const validGroups = emotionGroups.filter((group): group is DiaryEmotionGroup => Object.hasOwn(DIARY_EMOTION_GROUPS, group));
    const seasonDates = validSeasons.flatMap((season) => DIARY_SEASONS[season].months.map((month) => {
      const monthText = String(month).padStart(2, '0');
      if (nYear === null) return { contains: `-${monthText}-` };
      const year = nYear + (season === 'winter' && month < 3 ? 1 : 0);
      return { startsWith: `${year}-${monthText}-` };
    }));
    const groupEmotions = validGroups.flatMap((group) => [...DIARY_EMOTION_GROUPS[group].emotions]);
    const diaries = await prisma.diary.findMany({
      where: {
        email: auth.email,
        ...(seasonDates.length ? { OR: seasonDates.map((date) => ({ date })) } : { date: { gte: rangeStart, lte: rangeEnd } }),
        ...(groupEmotions.length ? { emotion: { in: groupEmotions } } : Number.isInteger(emotionFilter) && emotionFilter >= 0 && emotionFilter < EMOTIONS.length
          ? { emotion: emotionFilter }
          : {}),
      },
      skip: offset,
      take: limitNum,
      include: {
        images: {
          include: {
            imageContent: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { date: sortType.toLowerCase() as 'asc' | 'desc' },
      ],
    });

    return { ok: true, data: await formatDiaryList(diaries) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

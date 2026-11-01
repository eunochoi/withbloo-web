'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { DateParams, DiaryData } from './types';
import { createAuthErrorResult, createServerErrorResult, formatDiaryData, validateDateFormat } from './utils';

export const getDiaryByDate = async ({ date }: DateParams): Promise<ActionResult<DiaryData | null>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    if (!validateDateFormat(date)) {
      return { ok: false, code: 'INVALID_DATE', message: '날짜 형식이 올바르지 않습니다. (yyyy-MM-dd)' };
    }

    const diary = await prisma.diary.findFirst({
      where: {
        email: auth.email,
        date,
      },
      include: {
        images: {
          include: {
            imageContent: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!diary) return { ok: true, data: null };

    return { ok: true, data: await formatDiaryData(diary) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

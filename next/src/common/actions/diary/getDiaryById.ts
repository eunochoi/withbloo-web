'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { DiaryData, IdParams } from './types';
import { createAuthErrorResult, createServerErrorResult, formatDiaryData, parseDiaryId } from './utils';

export const getDiaryById = async ({ id }: IdParams): Promise<ActionResult<DiaryData | null>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const diaryId = parseDiaryId(id);
    if (!diaryId) return { ok: true, data: null };

    const diary = await prisma.diary.findFirst({
      where: {
        userId: auth.userId,
        id: diaryId,
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

    if (!diary) {
      return { ok: false, code: 'DIARY_NOT_FOUND', message: '다이어리를 찾을 수 없습니다.' };
    }

    return { ok: true, data: await formatDiaryData(diary) };
  } catch (error) {
    console.error(error);
    return createServerErrorResult();
  }
};

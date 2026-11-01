'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { DeleteDiaryParams } from './types';
import { createAuthErrorResult, createServerErrorResult, recomputeStreak } from './utils';

export const deleteDiary = async ({ id }: DeleteDiaryParams): Promise<ActionResult<string>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: auth.email },
        select: { id: true },
      });

      if (!user) throw new Error('USER_NOT_FOUND');

      const diary = await tx.diary.findFirst({
        where: { id, userId: user.id },
      });

      if (!diary) throw new Error('DIARY_NOT_FOUND');

      await tx.diary.delete({ where: { id: diary.id } });
    });

    await recomputeStreak(auth.email);
    return { ok: true, data: '일기 삭제 완료' };
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저가 존재하지 않습니다.' };
    }
    if (error instanceof Error && error.message === 'DIARY_NOT_FOUND') {
      return { ok: false, code: 'DIARY_NOT_FOUND', message: '게시글이 올바르지 않습니다.' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

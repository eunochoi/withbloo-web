'use server';

import { prisma } from '../../../../lib/prisma';
import { EMOTIONS } from '@/common/constants/emotions';
import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { getTodayStringInUserTimezone } from '@/common/utils/date/userTimezone';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { CreateDiaryParams, DiaryData } from './types';
import { createAuthErrorResult, createServerErrorResult, encryptDiaryText, formatDiaryData, isValidDiaryText, recomputeStreak, validateDateFormat, validateAccessibleImageContents } from './utils';

export const createDiary = async ({
  date,
  text,
  imageContentIds,
  emotion,
}: CreateDiaryParams): Promise<ActionResult<DiaryData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    if (!Number.isInteger(emotion) || emotion < 0 || emotion >= EMOTIONS.length) {
      return { ok: false, code: 'INVALID_EMOTION', message: '감정 값이 올바르지 않습니다. (0-11)' };
    }
    if (!validateDateFormat(date) || !date || date < '1900-01-01') {
      return { ok: false, code: 'INVALID_DIARY_INPUT', message: '날짜를 확인해주세요.' };
    }
    if (date > await getTodayStringInUserTimezone()) {
      return { ok: false, code: 'FUTURE_DIARY_DATE', message: '미래 날짜의 일기는 작성할 수 없습니다.' };
    }
    if (!isValidDiaryText(text)) {
      return { ok: false, code: 'INVALID_DIARY_INPUT', message: `일기 내용은 공백만 입력할 수 없으며 ${DIARY_TEXT_MAX_LENGTH}자까지 입력할 수 있습니다.` };
    }
    const diaryDate = date as string;

    const diary = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: auth.userId },
        select: { id: true },
      });

      if (!user) throw new Error('USER_NOT_FOUND');

      const existingDiary = await tx.diary.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: diaryDate,
          },
        },
      });

      if (existingDiary) {
        throw new Error('DIARY_ALREADY_EXISTS');
      }

      // Diary를 변경하기 전에 요청한 모든 이미지 콘텐츠가 현재 사용자에게 연결되어 있고 READY인지 확인한다.
      // 이 검증이 끝나기 전에는 기존 Image 연결을 삭제하지 않는다.
      await validateAccessibleImageContents(tx, imageContentIds, auth.userId);

      const diaryData = await tx.diary.create({
        data: { userId: user.id, email: auth.email, emotion, date: diaryDate, text: encryptDiaryText(text) },
      });

      await tx.image.deleteMany({
        where: { diaryId: diaryData.id },
      });

      if (imageContentIds.length > 0) {
        await tx.image.createMany({
          data: imageContentIds.map((imageContentId, index) => ({
            imageContentId,
            order: index,
            diaryId: diaryData.id,
          })),
        });
      }

      return tx.diary.findUniqueOrThrow({
        where: { id: diaryData.id },
        include: {
          images: {
            include: {
              imageContent: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    await recomputeStreak(auth.email);
    return { ok: true, data: await formatDiaryData(diary) };
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저가 존재하지 않습니다.' };
    }
    if ((error instanceof Error && error.message === 'DIARY_ALREADY_EXISTS') || (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')) {
      return { ok: false, code: 'DIARY_ALREADY_EXISTS', message: '해당 날짜에 일기가 이미 존재합니다.' };
    }
    if (error instanceof Error && error.message === 'INVALID_IMAGE_LIST') {
      return { ok: false, code: 'INVALID_IMAGE_LIST', message: '이미지 목록이 올바르지 않습니다.' };
    }
    if (error instanceof Error && error.message === 'IMAGE_NOT_OWNED') {
      return { ok: false, code: 'IMAGE_NOT_OWNED', message: '사용할 수 없는 이미지가 포함되어 있습니다.' };
    }

    console.error(error);
    return createServerErrorResult();
  }
};

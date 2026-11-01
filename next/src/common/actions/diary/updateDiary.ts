'use server';

import { prisma } from '../../../../lib/prisma';
import { EMOTIONS } from '@/common/constants/emotions';
import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { getTodayStringInUserTimezone } from '@/common/utils/date/userTimezone';
import { getAuth } from '../../auth/getAuth';
import type { ActionResult } from '../types';
import type { DiaryData, UpdateDiaryParams } from './types';
import { createAuthErrorResult, createServerErrorResult, encryptDiaryText, formatDiaryData, isValidDiaryText, parseDiaryId, validateDateFormat, recomputeStreak, validateAccessibleImageContents } from './utils';

export const updateDiary = async ({
  diaryId,
  date,
  text,
  imageContentIds,
  emotion,
}: UpdateDiaryParams): Promise<ActionResult<DiaryData>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const parsedDiaryId = parseDiaryId(diaryId);
    if (!parsedDiaryId) {
      return { ok: false, code: 'INVALID_DIARY_ID', message: 'diaryId는 필수입니다.' };
    }
    if (!Number.isInteger(emotion) || emotion < 0 || emotion >= EMOTIONS.length) {
      return { ok: false, code: 'INVALID_EMOTION', message: '감정 값이 올바르지 않습니다. (0-11)' };
    }
    if (!isValidDiaryText(text)) {
      return { ok: false, code: 'INVALID_DIARY_INPUT', message: `일기 내용은 공백만 입력할 수 없으며 ${DIARY_TEXT_MAX_LENGTH}자까지 입력할 수 있습니다.` };
    }
    const today = await getTodayStringInUserTimezone();
    if (date !== undefined && (!validateDateFormat(date) || date < '1900-01-01' || date > today)) {
      return { ok: false, code: 'INVALID_DIARY_DATE', message: '날짜를 확인해주세요.' };
    }

    const diary = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: auth.userId },
        select: { id: true },
      });

      if (!user) throw new Error('USER_NOT_FOUND');

      const foundDiary = await tx.diary.findFirst({
        where: { id: parsedDiaryId, userId: user.id },
      });

      if (!foundDiary) throw new Error('DIARY_NOT_FOUND');
      if (foundDiary.date > today) throw new Error('FUTURE_DIARY_DATE');

      // 기존 이미지 연결을 삭제하기 전에 모든 새 이미지의 소유권을 확인한다.
      await validateAccessibleImageContents(tx, imageContentIds, auth.userId);

      const targetDate = date ?? foundDiary.date;
      if (targetDate !== foundDiary.date) {
        const target = await tx.diary.findUnique({ where: { userId_date: { userId: user.id, date: targetDate } } });
        if (target) throw new Error('DIARY_ALREADY_EXISTS');
      }
      await tx.diary.update({
        where: { id: foundDiary.id },
        data: { date: targetDate, text: encryptDiaryText(text), emotion },
      });

      await tx.image.deleteMany({
        where: { diaryId: foundDiary.id },
      });

      if (imageContentIds.length > 0) {
        await tx.image.createMany({
          data: imageContentIds.map((imageContentId, index) => ({
            imageContentId,
            order: index,
            diaryId: foundDiary.id,
          })),
        });
      }

      return tx.diary.findUniqueOrThrow({
        where: { id: foundDiary.id },
        include: {
          images: {
            include: {
              imageContent: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    }, { isolationLevel: 'Serializable' });

    if (date !== undefined) await recomputeStreak(auth.email);
    return { ok: true, data: await formatDiaryData(diary) };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error.code === 'P2002' || error.code === 'P2034')) {
      return { ok: false, code: 'DIARY_CONFLICT', message: '날짜 또는 기록이 변경되었어요. 다시 확인하고 저장해주세요.' };
    }
    if (error instanceof Error && error.message === 'DIARY_ALREADY_EXISTS') {
      return { ok: false, code: 'DIARY_ALREADY_EXISTS', message: '해당 날짜를 사용할 수 없습니다.' };
    }
    if (error instanceof Error && error.message === 'FUTURE_DIARY_DATE') {
      return { ok: false, code: 'FUTURE_DIARY_DATE', message: '미래 날짜의 일기는 수정할 수 없습니다.' };
    }
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return { ok: false, code: 'USER_NOT_FOUND', message: '유저가 존재하지 않습니다.' };
    }
    if (error instanceof Error && error.message === 'DIARY_NOT_FOUND') {
      return { ok: false, code: 'DIARY_NOT_FOUND', message: '게시글이 올바르지 않습니다.' };
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

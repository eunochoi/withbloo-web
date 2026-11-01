import { prisma } from '../../../../../lib/prisma';
import type { Habit } from '@prisma/client';
import CryptoJS from 'crypto-js';
import type { Prisma } from '@prisma/client';

import type { AuthResult } from '../../../auth/getAuth';
import { DIARY_TEXT_MAX_LENGTH } from '../../../constants/diary';
import { getEnvValue } from '../../../utils/getEnvValue';
import { isValidLocalDateString } from '../../../utils/date/isValidLocalDateString';
import { recomputeUserDiaryStreak } from '../../streak';
import type { ActionResult } from '../../types';
import { DIARY_IMAGE_MAX_COUNT } from '../../../constants/image';
import { createImageSignedUrl } from '../../image/utils';
import type { DiaryData, DiaryWithRelations } from '../types';

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
  return isValidLocalDateString(dateString);
};

export const isValidDiaryText = (text: unknown): text is string => {
  return typeof text === 'string'
    && text.trim().length > 0
    && text.length <= DIARY_TEXT_MAX_LENGTH;
};

export const encryptDiaryText = (text: string) => {
  return CryptoJS.AES.encrypt(text, getEnvValue('DATA_SECRET_KEY')).toString();
};

const decryptDiaryText = (text: string) => {
  return CryptoJS.AES.decrypt(text, getEnvValue('DATA_SECRET_KEY')).toString(CryptoJS.enc.Utf8);
};

export const parseDiaryId = (id: string | number | null | undefined) => {
  const diaryId = Number(id);

  if (!id || Number.isNaN(diaryId)) {
    return null;
  }

  return diaryId;
};

export const validateAccessibleImageContents = async (
  tx: Prisma.TransactionClient,
  imageContentIds: unknown,
  userId: number,
) => {
  if (!Array.isArray(imageContentIds) || imageContentIds.length > DIARY_IMAGE_MAX_COUNT) {
    throw new Error('INVALID_IMAGE_LIST');
  }

  if (imageContentIds.some((imageContentId) => typeof imageContentId !== 'string' || imageContentId.length === 0)) {
    throw new Error('INVALID_IMAGE_LIST');
  }

  const uniqueImageContentIds = new Set(imageContentIds);
  if (uniqueImageContentIds.size !== imageContentIds.length) {
    throw new Error('INVALID_IMAGE_LIST');
  }

  const imageContents = await tx.imageContent.findMany({
    where: {
      id: { in: imageContentIds },
      status: 'READY',
      users: {
        some: {
          id: userId,
        },
      },
    },
    select: { id: true },
  });

  if (imageContents.length !== imageContentIds.length) {
    throw new Error('IMAGE_NOT_OWNED');
  }
};

export const formatDiaryData = async (diary: DiaryWithRelations, completedHabits?: Habit[]): Promise<DiaryData> => {
  const habits = completedHabits ?? (await prisma.habitCompletion.findMany({ where: { date: diary.date, habit: { userId: diary.userId } }, include: { habit: true }, orderBy: [{ habit: { priority: 'desc' } }, { habit: { createdAt: 'desc' } }, { habitId: 'desc' }] })).map((record) => record.habit);
  const images = await Promise.all(diary.images.map(async (image) => ({
    id: String(image.id),
    imageContentId: image.imageContentId,
    src: await createImageSignedUrl(image.imageContent.storagePath),
    order: image.order,
  })));

  return {
    email: diary.email,
    id: diary.id,
    date: diary.date,
    text: decryptDiaryText(diary.text),
    emotion: diary.emotion,
    Images: images,
    Habits: habits.map((habit) => ({
      UserId: habit.userId,
      id: habit.id,
      email: habit.email,
      name: habit.name,
      iconKey: habit.iconKey,
      iconColor: habit.iconColor,
      priority: habit.priority,
    })),
  };
};

export const recomputeStreak = async (email: string) => {
  await recomputeUserDiaryStreak(email);
};

// Batch date joins for diary lists so a page does not issue one query per diary.
export const formatDiaryList = async (diaries: DiaryWithRelations[]): Promise<DiaryData[]> => {
  if (!diaries.length) return [];
  const records = await prisma.habitCompletion.findMany({
    where: { date: { in: diaries.map((diary) => diary.date) }, habit: { userId: diaries[0].userId } },
    include: { habit: true },
    orderBy: [{ habit: { priority: 'desc' } }, { habit: { createdAt: 'desc' } }, { habitId: 'desc' }],
  });
  const byDate = new Map<string, Habit[]>();
  for (const record of records) {
    if (!byDate.has(record.date)) byDate.set(record.date, []);
    byDate.get(record.date)!.push(record.habit);
  }
  return Promise.all(diaries.map((diary) => formatDiaryData(diary, byDate.get(diary.date) ?? [])));
};

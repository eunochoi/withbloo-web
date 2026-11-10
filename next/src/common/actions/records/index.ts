'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '@/common/auth/getAuth';
import { validateAccessibleImageContents } from '@/common/actions/diary/utils';
import { createImageSignedUrl } from '@/common/actions/image/utils';
import type { DiaryImage } from '@/common/types/diary';

export type RecordScope = 'habit' | 'sober';
export type ActivityRecord = {
  id: number;
  type: 'MEMO' | 'RESTART';
  recordedAt: string;
  memo: string | null;
  images: DiaryImage[];
};
export type RecordCursor = { id: number; recordedAt: string };
async function formatRecords(rows: Array<{ id: number; type: 'MEMO' | 'RESTART'; recordedAt: string; memo: string | null; rawImages: Array<{ id: number; imageContentId: string; position: number; imageContent: { storagePath: string } }> }>): Promise<ActivityRecord[]> {
  return Promise.all(rows.map(async ({ rawImages, ...row }) => ({ ...row, images: await Promise.all(rawImages.map(async (image) => ({ id: String(image.id), imageContentId: image.imageContentId, order: image.position, src: await createImageSignedUrl(image.imageContent.storagePath) }))) })));
}
const validId = (id: number) => Number.isSafeInteger(id) && id > 0;
const failure = (message: string) => ({ ok: false as const, code: 'RECORD_ERROR', message });

export async function getActivityRecords(
  scope: RecordScope,
  parentId: number,
  sort: 'ASC' | 'DESC',
  cursor: RecordCursor | null = null,
) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (
    !['habit', 'sober'].includes(scope) ||
    !validId(parentId) ||
    !['ASC', 'DESC'].includes(sort) ||
    (cursor && (!validId(cursor.id) || !Number.isFinite(Date.parse(cursor.recordedAt))))
  )
    return failure('기록 조회 조건을 확인해주세요.');
  try {
    const direction = sort === 'ASC' ? 'asc' : 'desc';
    const comparison = sort === 'ASC' ? 'gt' : 'lt';
    const time = cursor ? new Date(cursor.recordedAt) : null;
    const rows =
      scope === 'habit'
        ? (
            await prisma.habitRecord.findMany({
              where: {
                habitId: parentId,
                habit: { userId: auth.userId },
                ...(cursor && time
                  ? {
                      OR: [
                        { recordedAt: { [comparison]: time } },
                        { recordedAt: time, id: { [comparison]: cursor.id } },
                      ],
                    }
                  : {}),
              },
              orderBy: [{ recordedAt: direction }, { id: direction }],
              include: { images: { include: { imageContent: true }, orderBy: { position: 'asc' } } },
              take: 21,
            })
          ).map((row) => ({
            id: row.id,
            type: 'MEMO' as const,
            recordedAt: row.recordedAt.toISOString(),
            memo: row.memo,
            rawImages: row.images,
          }))
        : (
            await prisma.soberRecord.findMany({
              where: {
                soberId: parentId,
                sober: { userId: auth.userId },
                ...(cursor && time
                  ? {
                      OR: [
                        { restartedAt: { [comparison]: time } },
                        { restartedAt: time, id: { [comparison]: cursor.id } },
                      ],
                    }
                  : {}),
              },
              orderBy: [{ restartedAt: direction }, { id: direction }],
              include: { images: { include: { imageContent: true }, orderBy: { position: 'asc' } } },
              take: 21,
            })
          ).map((row) => ({
            id: row.id,
            type: row.isRestart ? 'RESTART' as const : 'MEMO' as const,
            recordedAt: row.restartedAt.toISOString(),
            memo: row.memo,
            rawImages: row.images,
          }));
    const items = await formatRecords(rows.slice(0, 20));
    const last = items.at(-1);
    return {
      ok: true as const,
      data: {
        items,
        nextCursor: rows.length > 20 && last ? { id: last.id, recordedAt: last.recordedAt } : null,
      },
    };
  } catch {
    return failure('기록을 불러오지 못했어요.');
  }
}

export async function getActivityDay(
  scope: RecordScope,
  parentId: number,
  from: string,
  to: string,
) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  const start = new Date(from);
  const end = new Date(to);
  if (
    !['habit', 'sober'].includes(scope) ||
    !validId(parentId) ||
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    +end <= +start ||
    +end - +start > 27 * 3600000
  )
    return failure('날짜를 확인해주세요.');
  try {
    const rows =
      scope === 'habit'
        ? (
            await prisma.habitRecord.findMany({
              where: {
                habitId: parentId,
                habit: { userId: auth.userId },
                recordedAt: { gte: start, lt: end },
              },
              include: { images: { include: { imageContent: true }, orderBy: { position: 'asc' } } },
              orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }],
            })
          ).map((row) => ({
            id: row.id,
            type: 'MEMO' as const,
            recordedAt: row.recordedAt.toISOString(),
            memo: row.memo,
            rawImages: row.images,
          }))
        : (
            await prisma.soberRecord.findMany({
              where: {
                soberId: parentId,
                sober: { userId: auth.userId },
                restartedAt: { gte: start, lt: end },
              },
              include: { images: { include: { imageContent: true }, orderBy: { position: 'asc' } } },
              orderBy: [{ restartedAt: 'asc' }, { id: 'asc' }],
            })
          ).map((row) => ({
            id: row.id,
            type: row.isRestart ? 'RESTART' as const : 'MEMO' as const,
            recordedAt: row.restartedAt.toISOString(),
            memo: row.memo,
            rawImages: row.images,
          }));
    return { ok: true as const, data: await formatRecords(rows) };
  } catch {
    return failure('기록을 불러오지 못했어요.');
  }
}

export async function saveActivityRecord(
  scope: RecordScope,
  parentId: number,
  input: { id?: number; type: 'MEMO' | 'RESTART'; recordedAt: string; memo: string; imageContentIds?: string[] },
) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (input?.type === 'MEMO' && typeof input.memo === 'string' && !input.memo.trim())
    return failure('내용을 입력해주세요.');
  if (
    !['habit', 'sober'].includes(scope) ||
    !validId(parentId) ||
    !input ||
    (input.id !== undefined && !validId(input.id)) ||
    !['MEMO', 'RESTART'].includes(input.type) ||
    (scope === 'habit' && input.type !== 'MEMO') ||
    typeof input.memo !== 'string' ||
    input.memo.length > 500 ||
    typeof input.recordedAt !== 'string'
  )
    return failure('기록 내용을 확인해주세요.');
  const recordedAt = new Date(input.recordedAt);
  if (
    !Number.isFinite(+recordedAt) ||
    input.recordedAt !== recordedAt.toISOString() ||
    +recordedAt > Date.now()
  )
    return failure('현재 또는 과거 날짜와 시간을 선택해주세요.');
  try {
    await prisma.$transaction(async (tx) => {
      const parent =
        scope === 'habit'
          ? await tx.habit.findFirst({ where: { id: parentId, userId: auth.userId } })
          : await tx.sober.findFirst({ where: { id: parentId, userId: auth.userId } });
      if (!parent || recordedAt < parent.initialStartedAt)
        throw new Error('시작 일시 이후로 입력해주세요.');
      if (input.imageContentIds !== undefined) await validateAccessibleImageContents(tx, input.imageContentIds, auth.userId);
      let recordId = input.id;
      if (scope === 'habit') {
        const data = { recordedAt, memo: input.memo.trim() };
        if (input.id) {
          if (
            !(await tx.habitRecord.updateMany({ where: { id: input.id, habitId: parentId }, data }))
              .count
          )
            throw new Error('기록을 찾을 수 없어요.');
        } else recordId = (await tx.habitRecord.create({ data: { ...data, habitId: parentId } })).id;
      } else {
        const data = { restartedAt: recordedAt, memo: input.memo.trim() || null, isRestart: input.type === 'RESTART' };
        if (input.id) {
          if (
            !(
              await tx.soberRecord.updateMany({
                where: { id: input.id, soberId: parentId },
                data,
              })
            ).count
          )
            throw new Error('기록을 찾을 수 없어요.');
        } else
          recordId = (await tx.soberRecord.create({ data: { ...data, soberId: parentId } })).id;
      }
      if (input.imageContentIds !== undefined && recordId) {
        if (scope === 'habit') {
          await tx.habitRecordImage.deleteMany({ where: { habitRecordId: recordId } });
          await tx.habitRecordImage.createMany({ data: input.imageContentIds.map((imageContentId, position) => ({ habitRecordId: recordId!, imageContentId, position })) });
        } else {
          await tx.soberRecordImage.deleteMany({ where: { soberRecordId: recordId } });
          await tx.soberRecordImage.createMany({ data: input.imageContentIds.map((imageContentId, position) => ({ soberRecordId: recordId!, imageContentId, position })) });
        }
      }
    });
    return { ok: true as const, data: null };
  } catch (error) {
    return failure(
      error instanceof Error &&
        ['시작 일시 이후로 입력해주세요.', '기록을 찾을 수 없어요.'].includes(error.message)
        ? error.message
        : '기록을 저장하지 못했어요.',
    );
  }
}

export async function deleteActivityRecord(scope: RecordScope, parentId: number, id: number) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (!['habit', 'sober'].includes(scope) || !validId(parentId) || !validId(id))
    return failure('기록을 확인해주세요.');
  try {
    const result =
      scope === 'habit'
        ? await prisma.habitRecord.deleteMany({
            where: { id, habitId: parentId, habit: { userId: auth.userId } },
          })
        : await prisma.soberRecord.deleteMany({
            where: { id, soberId: parentId, sober: { userId: auth.userId } },
          });
    return result.count ? { ok: true as const, data: null } : failure('기록을 찾을 수 없어요.');
  } catch {
    return failure('기록을 삭제하지 못했어요.');
  }
}

export async function getActivityDates(
  scope: RecordScope,
  parentId: number,
  from: string,
  to: string,
) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  const start = new Date(from);
  const end = new Date(to);
  if (
    !['habit', 'sober'].includes(scope) ||
    !validId(parentId) ||
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    +end <= +start ||
    +end - +start > 44 * 86400000
  )
    return failure('날짜를 확인해주세요.');
  try {
    const dates =
      scope === 'habit'
        ? (
            await prisma.habitRecord.findMany({
              where: {
                habitId: parentId,
                habit: { userId: auth.userId },
                recordedAt: { gte: start, lt: end },
              },
              select: { recordedAt: true },
            })
          ).map((row) => row.recordedAt.toISOString())
        : (
            await prisma.soberRecord.findMany({
              where: {
                soberId: parentId,
                sober: { userId: auth.userId },
                restartedAt: { gte: start, lt: end },
                isRestart: false,
              },
              select: { restartedAt: true },
            })
          ).map((row) => row.restartedAt.toISOString());
    return { ok: true as const, data: dates };
  } catch {
    return failure('기록 날짜를 불러오지 못했어요.');
  }
}

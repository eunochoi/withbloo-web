'use server';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '@/common/auth/getAuth';
import { SOBER_ICONS, SOBER_NAME_MAX_LENGTH } from '@/common/constants/sober';
import { isHabitIconColor } from '@/common/constants/habitIconColors';

export interface SoberInput {
  id?: number;
  name: string;
  description: string;
  iconKey: string;
  iconColor: string;
  isPriority: boolean;
  initialStartedAt: string;
  goalMode: 'AUTO' | 'MANUAL';
  goalDays: number | null;
}

export async function getSobers() {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  try {
    const items = await prisma.sober.findMany({
      where: { userId: auth.userId },
      include: {
        restarts: { orderBy: [{ restartedAt: 'asc' }, { id: 'asc' }] },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return { ok: true as const, data: items };
  } catch {
    return {
      ok: false as const,
      code: 'SERVER_ERROR',
      message: '거리두기 기록을 불러오지 못했어요.',
    };
  }
}

export async function saveSober(input: SoberInput) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (
    !input ||
    typeof input.name !== 'string' ||
    typeof input.description !== 'string' ||
    typeof input.iconKey !== 'string' ||
    typeof input.iconColor !== 'string' ||
    typeof input.initialStartedAt !== 'string' ||
    typeof input.isPriority !== 'boolean' ||
    (input.id !== undefined &&
      (!Number.isSafeInteger(input.id) || input.id <= 0))
  )
    return {
      ok: false as const,
      code: 'INVALID_INPUT',
      message: '거리두기 설정을 확인해주세요.',
    };
  const start = new Date(input.initialStartedAt);
  if (
    !input.name.trim() ||
    input.name.trim().length > SOBER_NAME_MAX_LENGTH ||
    input.description.length > 500 ||
    !isHabitIconColor(input.iconColor) ||
    !Object.hasOwn(SOBER_ICONS, input.iconKey) ||
    !Number.isFinite(start.getTime()) ||
    start.getTime() > Date.now() ||
    start.getUTCFullYear() < 1900 ||
    !['AUTO', 'MANUAL'].includes(input.goalMode) ||
    (input.goalMode === 'MANUAL'
      ? !Number.isSafeInteger(input.goalDays) ||
        input.goalDays! < 1 ||
        input.goalDays! > 36500
      : input.goalDays !== null)
  )
    return {
      ok: false as const,
      code: 'INVALID_INPUT',
      message: '거리두기 설정을 확인해주세요.',
    };
  try {
    const item = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${auth.userId} FOR UPDATE`;
      const data = {
        name: input.name.trim(),
        description: input.description.trim() || null,
        iconKey: input.iconKey,
        iconColor: input.iconColor,
        isPriority: input.isPriority,
        goalMode: input.goalMode,
        goalDays: input.goalDays,
      };
      if (input.id) {
        const existing = await tx.sober.findFirst({
          where: { id: input.id, userId: auth.userId },
        });
        if (
          !existing ||
          existing.initialStartedAt.getTime() !== start.getTime()
        )
          throw new Error('항목 또는 시작 일시를 확인해주세요.');
        return tx.sober.update({ where: { id: existing.id }, data });
      }
      if ((await tx.sober.count({ where: { userId: auth.userId } })) >= 10)
        throw new Error('거리두기는 최대 10개까지 만들 수 있어요.');
      return tx.sober.create({
        data: { ...data, userId: auth.userId, initialStartedAt: start },
      });
    });
    return { ok: true as const, data: item };
  } catch (error) {
    return {
      ok: false as const,
      code: 'SAVE_FAILED',
      message:
        error instanceof Error && error.message.includes('최대')
          ? error.message
          : '저장하지 못했어요. 이름이 중복되는지 확인해주세요.',
    };
  }
}

export async function deleteSober(id: number) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  try {
    const result = await prisma.sober.deleteMany({
      where: { id, userId: auth.userId },
    });
    return result.count
      ? { ok: true as const, data: null }
      : {
          ok: false as const,
          code: 'NOT_FOUND',
          message: '항목을 찾을 수 없어요.',
        };
  } catch {
    return {
      ok: false as const,
      code: 'SERVER_ERROR',
      message: '삭제하지 못했어요.',
    };
  }
}

export async function saveSoberRestart(input: {
  id?: number;
  soberId: number;
  restartedAt: string;
  memo: string;
}) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (
    !input ||
    !Number.isSafeInteger(input.soberId) ||
    input.soberId <= 0 ||
    (input.id !== undefined &&
      (!Number.isSafeInteger(input.id) || input.id <= 0)) ||
    typeof input.restartedAt !== 'string' ||
    typeof input.memo !== 'string'
  )
    return {
      ok: false as const,
      code: 'INVALID_INPUT',
      message: '기록을 확인해주세요.',
    };
  const timestamp = new Date(input.restartedAt);
  if (
    !Number.isFinite(timestamp.getTime()) ||
    timestamp.getTime() > Date.now() ||
    input.memo.length > 500
  )
    return {
      ok: false as const,
      code: 'INVALID_INPUT',
      message: '일시와 메모를 확인해주세요.',
    };
  try {
    const item = await prisma.$transaction(async (tx) => {
      const sober = await tx.sober.findFirst({
        where: { id: input.soberId, userId: auth.userId },
      });
      if (!sober || timestamp < sober.initialStartedAt)
        throw new Error('시작 일시 이후로 입력해주세요.');
      const data = { restartedAt: timestamp, memo: input.memo.trim() || null };
      if (input.id) {
        const result = await tx.soberRestart.updateMany({
          where: { id: input.id, soberId: sober.id },
          data,
        });
        if (!result.count) throw new Error('기록을 찾을 수 없어요.');
        return input.id;
      }
      return (
        await tx.soberRestart.create({ data: { ...data, soberId: sober.id } })
      ).id;
    });
    return { ok: true as const, data: item };
  } catch (error) {
    const message =
      error instanceof Error &&
      ['시작 일시 이후로 입력해주세요.', '기록을 찾을 수 없어요.'].includes(
        error.message,
      )
        ? error.message
        : '기록을 저장하지 못했어요.';
    return { ok: false as const, code: 'SAVE_FAILED', message };
  }
}

export async function deleteSoberRestart(soberId: number, id: number) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  try {
    const result = await prisma.soberRestart.deleteMany({
      where: { id, soberId, sober: { userId: auth.userId } },
    });
    return result.count
      ? { ok: true as const, data: null }
      : {
          ok: false as const,
          code: 'NOT_FOUND',
          message: '기록을 찾을 수 없어요.',
        };
  } catch {
    return {
      ok: false as const,
      code: 'SERVER_ERROR',
      message: '기록을 삭제하지 못했어요.',
    };
  }
}

export async function getSoberMemos(
  soberId: number,
  sort: 'ASC' | 'DESC',
  cursor: { restartedAt: string; id: number } | null,
) {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (
    !Number.isSafeInteger(soberId) ||
    soberId <= 0 ||
    !['ASC', 'DESC'].includes(sort) ||
    (cursor &&
      (!Number.isSafeInteger(cursor.id) ||
        cursor.id <= 0 ||
        !Number.isFinite(Date.parse(cursor.restartedAt))))
  )
    return {
      ok: false as const,
      code: 'INVALID_INPUT',
      message: '메모 기록을 확인해주세요.',
    };
  try {
    const date = cursor ? new Date(cursor.restartedAt) : null;
    const rows = await prisma.soberRestart.findMany({
      where: {
        soberId,
        sober: { userId: auth.userId },
        memo: { not: null },
        ...(cursor && date
          ? {
              OR: [
                { restartedAt: { [sort === 'ASC' ? 'gt' : 'lt']: date } },
                {
                  restartedAt: date,
                  id: { [sort === 'ASC' ? 'gt' : 'lt']: cursor.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        { restartedAt: sort === 'ASC' ? 'asc' : 'desc' },
        { id: sort === 'ASC' ? 'asc' : 'desc' },
      ],
      take: 21,
    });
    const items = rows.slice(0, 20);
    const last = items.at(-1);
    return {
      ok: true as const,
      data: {
        items,
        nextCursor:
          rows.length > 20 && last
            ? { id: last.id, restartedAt: last.restartedAt.toISOString() }
            : null,
      },
    };
  } catch {
    return {
      ok: false as const,
      code: 'SERVER_ERROR',
      message: '메모 기록을 불러오지 못했어요.',
    };
  }
}

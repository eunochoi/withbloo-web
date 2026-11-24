'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';
import { formatDiaryList } from '@/common/actions/diary/utils';
import { formatRecordImages } from '@/common/actions/records/images';
import type { ActionResult } from '@/common/actions/types';
import { getAuth } from '@/common/auth/getAuth';
import { DIARY_EMOTION_GROUPS, DIARY_SEASONS } from '@/common/constants/diaryFilters';
import { FEED_KINDS, type FeedCursor, type FeedFilters, type FeedItem, type FeedKind } from '@/common/types/feed';
import type { DiarySort } from '@/common/types/sort';
import { isValidLocalDateString } from '@/common/utils/date/isValidLocalDateString';
import { getUserTimezone } from '@/common/utils/date/userTimezone';

const PAGE_SIZE = 20;
const DIARY_SOURCE = 0;
const HABIT_SOURCE = 1;
const SOBER_SOURCE = 2;

function validKinds(kinds: FeedKind[]) {
  return Array.isArray(kinds) && kinds.length > 0 && kinds.every((kind) => FEED_KINDS.includes(kind));
}

function feedSources(userId: number, filters: FeedFilters, timezone: string) {
  const { kinds } = filters;
  const sources = [];
  if (kinds.includes('diary')) {
    const groups = filters.groups.filter((group) => Object.hasOwn(DIARY_EMOTION_GROUPS, group));
    const emotions = groups.flatMap((group) => [...DIARY_EMOTION_GROUPS[group].emotions]);
    sources.push(Prisma.sql`
      SELECT d."id", d."date", NULL::timestamp AS "recordedAt", ${DIARY_SOURCE}::int AS "source"
      FROM "Diary" d
      WHERE d."UserId" = ${userId}
      ${diaryPeriod(filters)}
      ${emotions.length ? Prisma.sql`AND d."emotion" IN (${Prisma.join(emotions)})` : Prisma.empty}
    `);
  }
  if (kinds.includes('habit')) {
    sources.push(Prisma.sql`
      SELECT r."id", to_char(r."recordedAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS "date",
        r."recordedAt", ${HABIT_SOURCE}::int AS "source"
      FROM "HabitRecord" r JOIN "Habit" h ON h."id" = r."habitId"
      WHERE h."UserId" = ${userId}
    `);
  }
  if (kinds.includes('sober')) {
    sources.push(Prisma.sql`
      SELECT r."id", to_char(r."recordedAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS "date",
        r."recordedAt", ${SOBER_SOURCE}::int AS "source"
      FROM "SoberRecord" r JOIN "Sober" s ON s."id" = r."soberId"
      WHERE s."userId" = ${userId}
    `);
  }
  return Prisma.join(sources, ' UNION ALL ');
}

function diaryPeriod({ year, seasons }: FeedFilters) {
  const validSeasons = seasons.filter((season) => Object.hasOwn(DIARY_SEASONS, season));
  if (validSeasons.length) {
    const months = validSeasons.flatMap((season) => DIARY_SEASONS[season].months.map((value) => {
      const monthText = String(value).padStart(2, '0');
      return year === null ? monthText : `${year + (season === 'winter' && value < 3 ? 1 : 0)}-${monthText}`;
    }));
    return year === null
      ? Prisma.sql`AND substring("date", 6, 2) IN (${Prisma.join(months)})`
      : Prisma.sql`AND left("date", 7) IN (${Prisma.join(months)})`;
  }
  if (year === null) return Prisma.empty;
  return Prisma.sql`AND left("date", 4) = ${String(year)}`;
}

export async function getFeed(
  filters: FeedFilters,
  sort: DiarySort,
  cursor: FeedCursor | null,
): Promise<ActionResult<{ items: FeedItem[]; nextCursor: FeedCursor | null }>> {
  const auth = await getAuth();
  if (!auth.ok) return auth;
  if (
    !filters || !validKinds(filters.kinds) || !Array.isArray(filters.seasons) || !Array.isArray(filters.groups) ||
    (filters.year !== null && (!Number.isInteger(filters.year) || filters.year < 1000 || filters.year > 9999)) ||
    !['ASC', 'DESC'].includes(sort) ||
    (cursor && (!isValidLocalDateString(cursor.date) || !Number.isFinite(Date.parse(cursor.orderAt)) ||
      ![DIARY_SOURCE, HABIT_SOURCE, SOBER_SOURCE].includes(cursor.source) ||
      !Number.isSafeInteger(cursor.id) || cursor.id <= 0))
  ) return { ok: false, code: 'INVALID_FEED_FILTERS', message: '기록 조회 조건을 확인해 주세요.' };

  try {
    const timezone = await getUserTimezone();
    const direction = sort === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const comparison = sort === 'ASC' ? Prisma.sql`>` : Prisma.sql`<`;
    // Diaries are date-only and appear before timed entries on their day in both sort directions.
    const diaryOrder = sort === 'ASC' ? Prisma.sql`timestamp '0001-01-01'` : Prisma.sql`timestamp '9999-12-31'`;
    const keys = await prisma.$queryRaw<Array<Omit<FeedCursor, 'orderAt'> & { orderAt: Date }>>`
      SELECT "id", "date", "source", "orderAt"
      FROM (
        SELECT "id", "date", "source", coalesce("recordedAt", ${diaryOrder}) AS "orderAt"
        FROM (${feedSources(auth.userId, filters, timezone)}) sources
      ) feed
      ${cursor ? Prisma.sql`WHERE ("date", "orderAt", "source", "id") ${comparison}
        (${cursor.date}, ${new Date(cursor.orderAt).toISOString()}::timestamp, ${cursor.source}, ${cursor.id})` : Prisma.empty}
      ORDER BY "date" ${direction}, "orderAt" ${direction}, "source" ${direction}, "id" ${direction}
      LIMIT ${PAGE_SIZE + 1}
    `;
    const page = keys.slice(0, PAGE_SIZE);
    const ids = (source: number) => page.filter((key) => key.source === source).map((key) => key.id);
    const diaryIds = ids(DIARY_SOURCE);
    const habitIds = ids(HABIT_SOURCE);
    const soberIds = ids(SOBER_SOURCE);
    const recordImages = { include: { imageContent: true }, orderBy: { position: 'asc' as const } };
    const [diaries, habits, sober] = await Promise.all([
      diaryIds.length ? prisma.diary.findMany({
        where: { userId: auth.userId, id: { in: diaryIds } },
        include: { images: { include: { imageContent: true }, orderBy: { order: 'asc' } } },
      }) : [],
      habitIds.length ? prisma.habitRecord.findMany({
        where: { habit: { userId: auth.userId }, id: { in: habitIds } },
        include: { habit: { select: { name: true, iconKey: true, iconColor: true, initialStartedAt: true } }, images: recordImages },
      }) : [],
      soberIds.length ? prisma.soberRecord.findMany({
        where: { sober: { userId: auth.userId }, id: { in: soberIds } },
        include: { sober: { select: { name: true, iconKey: true, iconColor: true, initialStartedAt: true } }, images: recordImages },
      }) : [],
    ]);
    const diaryMap = new Map((await formatDiaryList(diaries)).map((diary) => [diary.id, diary]));
    const habitMap = new Map(habits.map((record) => [record.id, record]));
    const soberMap = new Map(sober.map((record) => [record.id, record]));
    const time = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
    const items = await Promise.all(page.map(async ({ id, date, source }): Promise<FeedItem | null> => {
      if (source === DIARY_SOURCE) {
        const diary = diaryMap.get(id);
        return diary ? { kind: 'diary', id, date, diary } : null;
      }
      const habit = habitMap.get(id);
      const soberRecord = soberMap.get(id);
      const record = source === HABIT_SOURCE ? habit : soberRecord;
      if (!record) return null;
      const recordedAt = 'recordedAt' in record ? record.recordedAt : record.restartedAt;
      const { initialStartedAt, ...parent } = 'habit' in record ? record.habit : record.sober;
      return {
        kind: 'habit' in record ? 'habit' : 'sober',
        id, date,
        parentId: 'habit' in record ? record.habitId : record.soberId,
        ...parent,
        initialStartedAt: initialStartedAt.toISOString(),
        recordedAt: recordedAt.toISOString(),
        timeLabel: time.format(recordedAt),
        isRestart: 'isRestart' in record && record.isRestart,
        memo: record.memo,
        images: await formatRecordImages(record.images),
      };
    }));
    const last = page.at(-1);
    return {
      ok: true,
      data: {
        items: items.filter((item) => item !== null),
        nextCursor: keys.length > PAGE_SIZE && last ? { ...last, orderAt: last.orderAt.toISOString() } : null,
      },
    };
  } catch (error) {
    console.error(error);
    return { ok: false, code: 'FEED_ERROR', message: '기록을 불러오지 못했어요.' };
  }
}

import { prisma } from '../../../../lib/prisma';
import { addDaysToDateString, getDateStringDayDiff, getTodayStringInUserTimezone } from '../../utils/date/userTimezone';

export type DiaryStreakStatus = 'current' | 'pending' | 'none';

export interface DiaryStreakResult {
  currentStreak: number;
  longestStreak: number;
  hasTodayDiary: boolean;
  hasYesterdayDiary: boolean;
  status: DiaryStreakStatus;
}

const countConsecutiveDatesEndingAt = (dates: string[], endDate: string) => {
  const endDateIndex = dates.indexOf(endDate);
  if (endDateIndex < 0) return 0;

  let streak = 1;
  for (let i = endDateIndex - 1; i >= 0; i -= 1) {
    const diffDays = getDateStringDayDiff(dates[i], dates[i + 1]);

    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const getLongestStreak = (dates: string[]) => {
  if (dates.length === 0) return 0;

  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const diffDays = getDateStringDayDiff(dates[i - 1], dates[i]);

    if (diffDays === 1) {
      tempStreak += 1;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  return Math.max(longestStreak, tempStreak);
};

export const calculateDiaryStreak = async (diaryDates: string[]): Promise<DiaryStreakResult> => {
  const uniqueDates = Array.from(new Set(diaryDates)).sort();
  const todayStr = await getTodayStringInUserTimezone();
  const yesterdayStr = addDaysToDateString(todayStr, -1);

  const hasTodayDiary = uniqueDates.includes(todayStr);
  const hasYesterdayDiary = uniqueDates.includes(yesterdayStr);
  const streakEndDate = hasTodayDiary ? todayStr : hasYesterdayDiary ? yesterdayStr : null;
  const currentStreak = streakEndDate
    ? countConsecutiveDatesEndingAt(uniqueDates, streakEndDate)
    : 0;
  const longestStreak = getLongestStreak(uniqueDates);

  return {
    currentStreak,
    longestStreak,
    hasTodayDiary,
    hasYesterdayDiary,
    status: hasTodayDiary ? 'current' : currentStreak > 0 ? 'pending' : 'none',
  };
};

export const computeDiaryStreakByEmail = async (email: string) => {
  const diaries = await prisma.diary.findMany({
    where: { email },
    select: { date: true },
  });

  return calculateDiaryStreak(diaries.map((diary) => diary.date));
};

export const recomputeUserDiaryStreak = async (email: string) => {
  const streak = await computeDiaryStreakByEmail(email);

  await prisma.user.update({
    where: { email },
    data: {
      currentStreakDays: streak.currentStreak,
      longestStreakDays: streak.longestStreak,
    },
  });

  return streak;
};

export type YearParams = {
  year: number;
};

export type StreakUnits = {
  days: number;
  weeks: number;
  months: number;
};

export interface DiaryStats {
  totalCount: number;
  emotionCounts: number[];
  currentStreak: StreakUnits;
  longestStreak: StreakUnits;
  hasTodayDiary: boolean;
  hasYesterdayDiary: boolean;
  streakStatus: 'current' | 'pending' | 'none';
  monthlyCount: number[];
  halfYearEmotionCounts: number[][];
}

export interface HabitCount {
  id: number;
  name: string;
  priority: number;
  iconKey: string;
  iconColor: string;
  count: number;
}

export interface HabitStats {
  topHabits: HabitCount[];
  bottomHabits: HabitCount[];
}

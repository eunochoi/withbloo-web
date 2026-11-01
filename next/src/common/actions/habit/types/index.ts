import type { HabitIconColorKey } from '../../../constants/habitIconColors';
import type { Habit } from '@prisma/client';
import type { HabitIconKey } from '../../../constants/habitIcons';
import type { HabitSort } from '../../../types/sort';

export type IdParams = {
  id: string | number | null | undefined;
};

export type HabitListParams = {
  sortType: HabitSort;
  priorityFirst?: boolean;
  customHabitOrder?: number[];
};

export type HabitsByDateParams = {
  date: string;
};

export type HabitYearParams = {
  id: string | null;
  year: string;
};

export type HabitFormParams = {
  habitId?: string | number | null;
  habitName: string;
  priority: number;
  iconKey?: string;
  iconColor?: string;
  initialStartedAt?: string;
};

export type DeleteHabitParams = {
  habitId: number;
};

export type CheckHabitParams = {
  habitId: number;
  date: string;
};

export type HabitData = Omit<Habit, 'userId' | 'createdAt' | 'updatedAt' | 'iconKey' | 'iconColor' | 'initialStartedAt'> & {
  UserId: number;
  iconKey: HabitIconKey;
  iconColor: HabitIconColorKey;
  initialStartedAt: string;
  startedDate: string;
  latestRecordedDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HabitPageData = HabitData & { recentDateStatus: boolean[] };

export type TodayHabitStat = {
  createdHabits: number;
  todayDoneHabits: number;
  excludedCompleted: number;
};

export type HabitByDate = {
  id: number;
  name: string;
  priority: number;
  iconKey: string;
  iconColor: string;
  canEdit: boolean;
  completed: boolean;
};

export type HabitsByDate = {
  summary: { total: number; completed: number; excludedCompleted: number };
  habits: HabitByDate[];
  canEdit: boolean;
  isFuture: boolean;
};

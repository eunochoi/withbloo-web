import { getHabitById, getHabitFlow, getHabitList, getHabitMonthData, getHabitPageData, getHabitYearlyStatus, getHabitsByDate, getTodayHabitStat } from '@/common/actions/habit';
import type { QueryActionRunner } from '@/common/queries/queryAction';
import { queryOptions } from '@tanstack/react-query';

export const habitQueries = {
  flow: (date: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habit', 'flow', date],
    queryFn: () => runAction(() => getHabitFlow({ date })),
    staleTime: 60_000,
  }),
  page: (date: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habits', 'page', date],
    queryFn: () => runAction(() => getHabitPageData({ date })),
    staleTime: 60_000,
  }),
  list: (runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habits', 'list'],
    queryFn: () => runAction(getHabitList),
    staleTime: 60_000,
  }),
  byId: (id: string | null | undefined, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habit', 'id', id],
    queryFn: () => runAction(() => getHabitById({ id })),
    staleTime: 60_000,
  }),
  byDate: (date: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habit', 'date', date],
    queryFn: () => runAction(() => getHabitsByDate({ date })),
    staleTime: 60_000,
  }),
  todayStat: (runAction: QueryActionRunner, date?: string) => queryOptions({
    queryKey: ['habit', 'today-stat', date],
    queryFn: () => runAction(getTodayHabitStat),
    staleTime: 60_000,
  }),
  month: (id: string, month: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habit', 'id', id, 'month', month],
    queryFn: () => runAction(() => getHabitMonthData({ id, month })),
    staleTime: 60_000,
  }),
  year: (id: string, year: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['habit', 'id', id, 'year', year],
    queryFn: () => runAction(() => getHabitYearlyStatus({ id, year })),
    staleTime: 0,
  }),
};

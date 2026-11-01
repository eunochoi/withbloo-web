import { getDiaryByDate, getDiaryById, getDiaryHabitMonthData, getDiaryList } from '@/common/actions/diary';
import type { DiaryListParams } from '@/common/actions/diary/types';
import { DIARY_LIST_PAGE_SIZE } from '@/common/constants/diary';
import type { QueryActionRunner } from '@/common/queries/queryAction';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

type DiaryListFilters = Omit<DiaryListParams, 'pageParam' | 'limit'>;

export const diaryQueries = {
  list: ({ sortType, search, selectedYear, selectedMonth, seasons, emotionGroups }: DiaryListFilters, runAction: QueryActionRunner) => infiniteQueryOptions({
    queryKey: ['diary', 'diaryList', 'emotion', search, 'sort', sortType, 'year', selectedYear, 'month', selectedMonth, 'seasons', seasons ?? [], 'emotionGroups', emotionGroups ?? []],
    queryFn: ({ pageParam }) => runAction(() => getDiaryList({ sortType, search, selectedYear, selectedMonth, seasons, emotionGroups, pageParam, limit: DIARY_LIST_PAGE_SIZE })),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === 0 ? undefined : allPages.length),
    staleTime: 60_000,
  }),
  byId: (id: string | null | undefined, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['diary', 'id', id],
    queryFn: () => runAction(() => getDiaryById({ id })),
    staleTime: 60_000,
  }),
  byDate: (date: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['diary', 'date', date],
    queryFn: () => runAction(() => getDiaryByDate({ date })),
    staleTime: 60_000,
  }),
  habitMonth: (month: string, runAction: QueryActionRunner) => queryOptions({
    queryKey: ['diary-habit', 'month', month],
    queryFn: () => runAction(() => getDiaryHabitMonthData({ month })),
    staleTime: 60_000,
  }),
};

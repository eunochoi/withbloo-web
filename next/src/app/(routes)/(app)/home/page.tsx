import type { Metadata } from 'next';

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { statsQueries } from "@/common/queries/statsQueries";
import { diaryQueries } from "@/common/queries/diaryQueries";
import { habitQueries } from "@/common/queries/habitQueries";
import { unwrapQueryAction } from "@/common/queries/queryAction";
import { getTodayStringInUserTimezone } from "@/common/utils/date/userTimezone";
import HomeClientPage from "./HomeClientPage";

interface Props {
  searchParams?: {
    year?: string;
  };
}

export const metadata: Metadata = {
  title: '홈',
  description: '선택한 연도의 감정과 습관 기록을 살펴보고 오늘의 기록을 시작해요.',
};

const HomeServerPage = async ({ searchParams }: Props) => {
  const queryClient = new QueryClient();
  const initialDate = await getTodayStringInUserTimezone();
  const currentYear = Number(initialDate.slice(0, 4));
  const parsedYear = Number(searchParams?.year);
  const selectedYear = Number.isInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100 ? parsedYear : currentYear;

  await Promise.all([
    queryClient.prefetchQuery(statsQueries.years(unwrapQueryAction)),
    queryClient.prefetchQuery(statsQueries.diary(selectedYear, unwrapQueryAction)),
    queryClient.prefetchQuery(statsQueries.habit(selectedYear, unwrapQueryAction)),
    queryClient.prefetchQuery(diaryQueries.byDate(initialDate, unwrapQueryAction)),
    queryClient.prefetchQuery(habitQueries.todayStat(unwrapQueryAction, initialDate)),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomeClientPage initialDate={initialDate} />
    </HydrationBoundary>
  );
};

export default HomeServerPage;

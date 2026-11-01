import type { Metadata } from 'next';

import { habitQueries } from "@/common/queries/habitQueries";
import { unwrapQueryAction } from "@/common/queries/queryAction";
import { getTodayStringInUserTimezone } from "@/common/utils/date/userTimezone";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import HabitClientPage from "./HabitClientPage";

export const metadata: Metadata = {
  title: '습관 관리',
  description: '나만의 습관을 만들고 매일의 실천을 기록해요.',
};

const HabitServerPage = async () => {
  const queryClient = new QueryClient();
  const todayString = await getTodayStringInUserTimezone();

  await queryClient.prefetchQuery(habitQueries.page(todayString, unwrapQueryAction));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HabitClientPage todayString={todayString} />
    </HydrationBoundary>
  );
};

export default HabitServerPage;

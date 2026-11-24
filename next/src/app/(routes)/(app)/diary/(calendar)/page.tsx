import type { Metadata } from 'next';

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { diaryQueries } from '@/common/queries/diaryQueries';
import { habitQueries } from '@/common/queries/habitQueries';
import { unwrapQueryAction } from '@/common/queries/queryAction';
import { getTodayStringInUserTimezone } from '@/common/utils/date/userTimezone';
import CalendarClientPage from './CalendarClientPage';

export const metadata: Metadata = {
  title: '일기 달력',
  description: '달력에서 날짜별 감정과 일기, 습관 기록을 확인해요.',
};

const CalendarServerPage = async () => {
  const initialDate = await getTodayStringInUserTimezone();
  const month = initialDate.slice(0, 7);
  // 요청별 캐시를 사용해 사용자 간 데이터가 공유되지 않도록 한다.
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(diaryQueries.byDate(initialDate, unwrapQueryAction)),
    queryClient.prefetchQuery(habitQueries.byDate(initialDate, unwrapQueryAction)),
    queryClient.prefetchQuery(diaryQueries.habitMonth(month, unwrapQueryAction)),
  ]);

  // 실패한 프리패치는 제외되고, 해당 데이터는 클라이언트에서 다시 조회한다.
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CalendarClientPage initialDate={initialDate} />
    </HydrationBoundary>
  );
};

export default CalendarServerPage;

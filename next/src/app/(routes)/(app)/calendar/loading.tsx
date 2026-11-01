import AppPageLayout from '@/common/components/layout/AppPageLayout';
import CalendarPageSkeleton from './_components/CalendarPageSkeleton';
import AppPageTitle from '@/common/components/layout/AppPageTitle';

const CalendarLoading = () => (
  <AppPageLayout
      fixedDesktop
    header={<AppPageTitle title="월간 기록" hashtags="#기록 #발자국" />}
  >
    <CalendarPageSkeleton />
  </AppPageLayout>
);

export default CalendarLoading;

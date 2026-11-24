import AppPageLayout from'@/common/components/layout/AppPageLayout';
import CalendarPageSkeleton from'./_components/CalendarPageSkeleton';
import AppPageTitle from'@/common/components/layout/AppPageTitle';
import CalendarSummaryToolbar from'./_components/CalendarSummaryToolbar';

const CalendarLoading = () => (
  <AppPageLayout
    fixedDesktop
    toolbar={<CalendarSummaryToolbar />}
    header={<AppPageTitle title="일기 달력" hashtags="#기록 #발자국" />}
  >
    <CalendarPageSkeleton />
  </AppPageLayout>
);

export default CalendarLoading;

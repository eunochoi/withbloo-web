'use client';

import AppPageLayout from '@/common/components/layout/AppPageLayout';
import { useSortToggle } from '@/common/hooks/useSortToggle';
import FeedPageSkeleton from './_components/FeedPageSkeleton';
import FeedPageToolbar from './_components/FeedPageToolbar';
import AppPageTitle from '@/common/components/layout/AppPageTitle';

const noop = () => {};

const FeedLoading = () => {
  const { sortValue } = useSortToggle({ sortKey: 'diary' });

  return (
    <AppPageLayout
      header={<AppPageTitle title="기록 모음" hashtags="#일기 #습관 #거리두기" />}
      toolbar={
        <FeedPageToolbar onSort={noop} onFilter={noop} sortValue={sortValue} filterLabel="필터" filterDescription="전체 기간 · 전체 감정" disabled />
      }
    >
      <FeedPageSkeleton />
    </AppPageLayout>
  );
};

export default FeedLoading;

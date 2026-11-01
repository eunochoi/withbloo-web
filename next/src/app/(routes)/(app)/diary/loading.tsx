'use client';

import AppPageLayout from '@/common/components/layout/AppPageLayout';
import { useSortToggle } from '@/common/hooks/useSortToggle';
import DiaryPageSkeleton from './_components/DiaryPageSkeleton';
import DiaryPageToolbar from './_components/DiaryPageToolbar';
import AppPageTitle from '@/common/components/layout/AppPageTitle';

const noop = () => {};

const DiaryLoading = () => {
  const { sortValue } = useSortToggle({ sortKey: 'diary' });

  return (
    <AppPageLayout
      header={<AppPageTitle title="일기 목록" hashtags="#감정 #끄적끄적" />}
      toolbar={
        <DiaryPageToolbar onSort={noop} onFilter={noop} onAdd={noop} sortValue={sortValue} filterLabel="필터" filterDescription="전체 기간 · 전체 감정" disabled />
      }
    >
      <DiaryPageSkeleton />
    </AppPageLayout>
  );
};

export default DiaryLoading;

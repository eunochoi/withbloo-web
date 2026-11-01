'use client';

import AppPageLayout from '@/common/components/layout/AppPageLayout';
import HabitPageSkeleton from './_components/HabitPageSkeleton';
import AppPageTitle from '@/common/components/layout/AppPageTitle';
import HabitPageToolbar from './_components/HabitPageToolbar';
import { useHabitSortPreferences } from './_hooks/useHabitSortPreferences';

const HabitLoading = () => {
  const { sortValue, priorityFirst } = useHabitSortPreferences();

  return (
    <AppPageLayout
      header={<AppPageTitle title="습관 관리" hashtags="#실천 #성장" />}
      toolbar={
        <HabitPageToolbar
          onToggle={() => {}}
          onOpenFilter={() => {}}
          completedOnly={false}
          priorities={[]}
          onAddHabit={() => {}}
          sortValue={sortValue}
          priorityFirst={priorityFirst}
          disabledAdd
        />
      }
    >
      <HabitPageSkeleton />
    </AppPageLayout>
  );
};

export default HabitLoading;

'use client';

import { sortHabits } from '@/common/functions/sortHabits';

import SortPicker from '@/common/components/ui/SortPicker';
import { AnimatePresence } from 'framer-motion';
import HabitFilterPicker from './_components/HabitFilterPicker';
import HabitPageContent from "./_components/HabitPageContent";
import HabitPageSkeleton from "./_components/HabitPageSkeleton";
import HabitPageToolbar from "./_components/HabitPageToolbar";
import AppPageTitle from '@/common/components/layout/AppPageTitle';

import { authAction } from "@/common/auth/authAction";
import AppPageLayout from "@/common/components/layout/AppPageLayout";
import { MAX_HABIT_COUNT } from "@/common/constants/habit";
import { getTodayString } from "@/common/functions/getTodayString";
import { usePrefetchPage } from "@/common/hooks/usePrefetchPage";
import { habitQueries } from "@/common/queries/habitQueries";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { showNotice } from '@/common/components/ui/Notice/notice';
import { useEffect, useRef, useState } from "react";
import { useHabitSortPreferences } from "./_hooks/useHabitSortPreferences";

const HabitClientPage = ({ todayString }: { todayString: string }) => {
  usePrefetchPage();
  const [activeDate, setActiveDate] = useState(todayString);
  const router = useRouter();
  const [isSortOpen, setSortOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [priorities, setPriorities] = useState<number[]>([]);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { sortValue, priorityFirst, customHabitOrder, isStorageReady, setSort } = useHabitSortPreferences();

  useEffect(() => {
    const updateDate = () => setActiveDate(getTodayString());
    updateDate();
    const interval = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sortValue, priorityFirst]);

  const { data: habits, isError: isHabitsError, refetch: refetchHabits } = useQuery({
    ...habitQueries.page(activeDate, authAction),
    enabled: isStorageReady,
    select: (data) => sortHabits(data, { sortType: sortValue, priorityFirst, customHabitOrder }),
    placeholderData: (previousData, previousQuery) => previousQuery?.queryKey[2] === activeDate ? previousData : undefined,
  });

  const totalHabitCount = habits?.length ? habits?.length : 0;

  const filteredHabits = habits?.filter((habit) => (!completedOnly || habit.recentDateStatus[0]) && (!priorities.length || priorities.includes(habit.priority)));

  const onAddHabit = () => {
    if (habits && habits.length >= MAX_HABIT_COUNT) {
      showNotice(`습관은 최대 ${MAX_HABIT_COUNT}개 생성 가능합니다.`);
    }
    else {
      router.push('/habit/new', { scroll: false });
    }
  };

  return (
    <>
      <AppPageLayout
        header={<AppPageTitle title="습관 관리" hashtags="#실천 #성장" />}

        scrollRef={pageRef}
        toolbar={
          <HabitPageToolbar
            onToggle={() => setSortOpen(true)}
            onOpenFilter={() => setFilterOpen(true)}
            completedOnly={completedOnly}
            priorities={priorities}
            onAddHabit={onAddHabit}
            sortValue={sortValue}
            priorityFirst={priorityFirst}
            disabledAdd={!habits}
          />
        }
      >
        {habits === undefined && !isHabitsError ? (
          <HabitPageSkeleton />
        ) : habits === undefined ? (
          <div className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-center text-theme-text-secondary">
            <span>습관 목록을 불러오지 못했어요.</span>
            <button type="button" className="text-theme-accent" onClick={() => { void refetchHabits(); }}>다시 시도</button>
          </div>
        ) : (
          <HabitPageContent
            habits={filteredHabits}
            todayString={activeDate}
            totalHabitCount={totalHabitCount}
            showProgress={Boolean(habits?.some((habit) => habit.priority > 0)) && !(priorities.length === 1 && priorities[0] === 0)}
            onAddHabit={onAddHabit}
          />
        )}
      </AppPageLayout>
      <AnimatePresence>
        {isSortOpen && <SortPicker title="습관 정렬" value={sortValue} priorityFirst={priorityFirst} options={[{ value: 'DESC', label: '최신순' }, { value: 'ASC', label: '과거순' }, { value: 'CUSTOM', label: '커스텀' }]} onClose={() => setSortOpen(false)} onApply={(value, priority) => { setSort(value, priority); setSortOpen(false); }} />}
        {isFilterOpen && <HabitFilterPicker completedOnly={completedOnly} priorities={priorities} onClose={() => setFilterOpen(false)} onApply={(completed, selected) => { setCompletedOnly(completed); setPriorities(selected); setFilterOpen(false); }} />}
      </AnimatePresence>
    </>
  );
}

export default HabitClientPage;

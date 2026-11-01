'use client';

import DiaryPageContent from "./_components/DiaryPageContent";
import DiaryPageSkeleton from "./_components/DiaryPageSkeleton";
import DiaryPageToolbar from "./_components/DiaryPageToolbar";
import AppPageTitle from '@/common/components/layout/AppPageTitle';

import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";


import DiaryFilterPicker from './_components/DiaryFilterPicker';
import { authAction } from "@/common/auth/authAction";
import SortPicker from '@/common/components/ui/SortPicker';
import AppPageLayout from "@/common/components/layout/AppPageLayout";
import { getSelectionSummary } from '@/common/functions/toolbarSummary';
import { EMOTIONS } from "@/common/constants/emotions";
import { DIARY_EMOTION_GROUPS, DIARY_SEASONS, type DiaryEmotionGroup, type DiarySeason } from "@/common/constants/diaryFilters";
import { EMOTION_UNSELECTED, MONTH_UNSELECTED } from "@/common/constants/filterDefaults";
import { useCurrentUser } from "@/common/hooks/useCurrentUser";
import { usePrefetchPage } from "@/common/hooks/usePrefetchPage";
import { useSortToggle } from "@/common/hooks/useSortToggle";
import { diaryQueries } from "@/common/queries/diaryQueries";
import type { DiaryData } from "@/common/types/diary";
import { useDiaryListFilter } from "./_hooks/useDiaryListFilter";

const DiaryClientPage = () => {
  usePrefetchPage();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: user } = useCurrentUser();
  const currentUserEmail = user?.email ?? '';
  const { ref: inViewRef, inView } = useInView({ root: wrapperRef.current, threshold: 0, delay: 0 });

  const { selectedYear, selectedMonth, emotionToggle, setSelectedYear, setSelectedMonth, setEmotionToggle } = useDiaryListFilter();
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { sortValue, setSort } = useSortToggle({ sortKey: 'diary' });
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const seasons = (searchParams.get('seasons')?.split(',') ?? []).filter((value): value is DiarySeason => Object.prototype.hasOwnProperty.call(DIARY_SEASONS, value));
  const emotionGroups = (searchParams.get('groups')?.split(',') ?? []).filter((value): value is DiaryEmotionGroup => Object.prototype.hasOwnProperty.call(DIARY_EMOTION_GROUPS, value));
  const isEmotionSelected = emotionToggle !== EMOTION_UNSELECTED || (emotionGroups.length > 0 && emotionGroups.length < 3);
  const isPeriodSelected = selectedYear !== null || (seasons.length > 0 && seasons.length < 4);
  const selectedEmotionLabel = emotionGroups.length
    ? getSelectionSummary(emotionGroups.map((group) => DIARY_EMOTION_GROUPS[group].label), 3, '전체 감정')
    : EMOTIONS[emotionToggle]?.nameKr ?? '전체 감정';
  const seasonSummary = getSelectionSummary(seasons.map((season) => DIARY_SEASONS[season].label), 4, '');
  const selectedPeriodLabel = [selectedYear === null ? '' : `${selectedYear}년`, selectedMonth === MONTH_UNSELECTED ? '' : `${selectedMonth}월`, seasonSummary].filter(Boolean).join(' · ') || '전체 기간';
  const filterLabel = [
    selectedYear === null ? '' : selectedYear === new Date().getFullYear() ? '올해' : `${String(selectedYear % 100).padStart(2, '0')}년`,
    selectedMonth === MONTH_UNSELECTED ? '' : `${selectedMonth}월`,
    seasonSummary,
    getSelectionSummary(emotionGroups.map((group) => DIARY_EMOTION_GROUPS[group].label), 3, '') || (emotionGroups.length ? '' : EMOTIONS[emotionToggle]?.nameKr ?? ''),
  ].filter(Boolean).join(' · ') || '필터';

  const handleApplyFilter = (year: number | null, nextSeasons: DiarySeason[], groups: DiaryEmotionGroup[]) => {
    const params = new URLSearchParams(searchParams);
    if (year !== null) params.set('year', String(year)); else params.delete('year');
    if (nextSeasons.length) params.set('seasons', nextSeasons.join(',')); else params.delete('seasons');
    if (groups.length) params.set('groups', groups.join(',')); else params.delete('groups');
    params.delete('month');
    params.delete('emotion');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setSelectedYear(year);
    setSelectedMonth(MONTH_UNSELECTED);
    setEmotionToggle(EMOTION_UNSELECTED);
    setFilterOpen(false);
  };

  const { data: flatDiaries, fetchNextPage, isFetching, isPlaceholderData, hasNextPage, isError, refetch } = useInfiniteQuery({
    ...diaryQueries.list({ sortType: sortValue, search: emotionToggle, selectedYear, selectedMonth, seasons, emotionGroups }, authAction),
    placeholderData: keepPreviousData,
    select: (data) => data.pages.flat() as DiaryData[],
  });
  const isDiaryListEmpty = flatDiaries !== undefined && flatDiaries.length === 0;
  const hasAppliedFilter = isEmotionSelected || isPeriodSelected;

  useEffect(() => {
    if (currentUserEmail && !isFetching && !isPlaceholderData && hasNextPage && inView) fetchNextPage();
  }, [inView, hasNextPage, isFetching, isPlaceholderData, currentUserEmail, fetchNextPage])

  useEffect(() => {
    wrapperRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sortValue]);

  return (
    <>
      <AppPageLayout
        header={<AppPageTitle title="일기 목록" hashtags="#감정 #끄적끄적" />}

        scrollRef={wrapperRef}
        toolbar={
          <DiaryPageToolbar
            onSort={() => setIsSortOpen(true)}
            onFilter={() => setFilterOpen(true)}
            onAdd={() => router.push('/diary/new?allowDateChange=true', { scroll: false })}
            sortValue={sortValue}
            filterLabel={filterLabel}
            filterDescription={`${selectedPeriodLabel} · ${selectedEmotionLabel}`}
          />
        }
      >
        {flatDiaries === undefined && !isError ? (
          <DiaryPageSkeleton />
        ) : flatDiaries === undefined ? (
          <div className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-center text-theme-text-secondary">
            <span>일기 목록을 불러오지 못했어요.</span>
            <button type="button" className="text-theme-accent" onClick={() => { void refetch(); }}>다시 시도</button>
          </div>
        ) : (
          <DiaryPageContent
            flatDiaries={flatDiaries}
            isDiaryListEmpty={isDiaryListEmpty}
            hasAppliedFilter={hasAppliedFilter}
            inViewRef={inViewRef}
            statsYear={statsYear}
            setStatsYear={setStatsYear}
          />
        )}
      </AppPageLayout>
      <AnimatePresence>
        {isSortOpen && <SortPicker title="일기 정렬" value={sortValue} options={[{ value: 'DESC', label: '최신순' }, { value: 'ASC', label: '과거순' }]} onClose={() => setIsSortOpen(false)} onApply={(value) => { setSort(value); setIsSortOpen(false); }} />}
        {isFilterOpen && <DiaryFilterPicker year={selectedYear} seasons={seasons} emotionGroups={emotionGroups.length ? emotionGroups : (Object.keys(DIARY_EMOTION_GROUPS) as DiaryEmotionGroup[]).filter((group) => (DIARY_EMOTION_GROUPS[group].emotions as readonly number[]).includes(emotionToggle))} onClose={() => setFilterOpen(false)} onApply={handleApplyFilter} />}
      </AnimatePresence>
    </>
  );
}

export default DiaryClientPage;

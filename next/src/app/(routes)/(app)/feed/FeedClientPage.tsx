'use client';

import { authAction } from '@/common/auth/authAction';
import AppPageLayout from '@/common/components/layout/AppPageLayout';
import AppPageTitle from '@/common/components/layout/AppPageTitle';
import SortPicker from '@/common/components/ui/SortPicker';
import { DIARY_EMOTION_GROUPS, DIARY_SEASONS } from '@/common/constants/diaryFilters';
import { getSelectionSummary } from '@/common/functions/toolbarSummary';
import { useStoredFilters } from '@/common/hooks/useStoredFilters';
import { usePrefetchPage } from '@/common/hooks/usePrefetchPage';
import { useSortToggle } from '@/common/hooks/useSortToggle';
import { getFeed } from '@/common/actions/feed';
import { FEED_QUERY_KEY } from '@/common/constants/diary';
import { DEFAULT_FEED_FILTERS, FEED_KINDS, FEED_KIND_LABELS, type FeedCursor, type FeedFilters } from '@/common/types/feed';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import FeedFilterPicker from './_components/FeedFilterPicker';
import FeedPageContent from './_components/FeedPageContent';
import FeedPageSkeleton from './_components/FeedPageSkeleton';
import FeedPageToolbar from './_components/FeedPageToolbar';

export default function FeedClientPage() {
  usePrefetchPage();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { ref: inViewRef, inView } = useInView({ root: wrapperRef.current });
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSortOpen, setSortOpen] = useState(false);
  const { sortValue, setSort } = useSortToggle({ sortKey: 'diary' });
  const { value: filters, setStoredValue: setFilters, isStorageReady } = useStoredFilters('feed', DEFAULT_FEED_FILTERS);
  const { kinds, year, seasons, groups } = filters;
  const hasVisibleKinds = kinds.length > 0;
  const showDiary = kinds.includes('diary');
  const kindSummary = getSelectionSummary(kinds.map((kind) => FEED_KIND_LABELS[kind]), FEED_KINDS.length, '');
  const seasonSummary = getSelectionSummary(seasons.map((season) => DIARY_SEASONS[season].label), 4, '');
  const emotionSummary = getSelectionSummary(groups.map((group) => DIARY_EMOTION_GROUPS[group].label), 3, '');
  const filterLabel = hasVisibleKinds ? [
    kindSummary,
    ...(showDiary ? [
      year === null ? '' : year === new Date().getFullYear() ? '올해' : `${year}년`,
      seasonSummary,
      emotionSummary,
    ] : []),
  ].filter(Boolean).join(' · ') : '표시 안 함';

  const scrollToTop = () => wrapperRef.current?.scrollTo({ top: 0 });
  const applyFilters = (next: FeedFilters) => {
    if (next !== filters) {
      setFilters(next);
      scrollToTop();
    }
    setFilterOpen(false);
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isError, isFetchNextPageError, refetch } =
    useInfiniteQuery({
      queryKey: [...FEED_QUERY_KEY, 'list', filters, sortValue],
      queryFn: ({ pageParam }) => authAction(() => getFeed(filters, sortValue, pageParam)),
      initialPageParam: null as FeedCursor | null,
      getNextPageParam: (page) => page.nextCursor ?? undefined,
      enabled: isStorageReady && hasVisibleKinds,
      staleTime: 60_000,
    });
  const items = hasVisibleKinds ? data?.pages.flatMap((page) => page.items) : [];

  useEffect(() => {
    if (isStorageReady && inView && hasNextPage && !isFetching && !isError) {
      void fetchNextPage();
    }
  }, [isStorageReady, inView, hasNextPage, isFetching, isError, fetchNextPage]);

  return (
    <>
      <AppPageLayout
        header={<AppPageTitle title="기록 모음" hashtags="#일기 #습관 #거리두기" />}
        scrollRef={wrapperRef}
        toolbar={
          <FeedPageToolbar
            onSort={() => setSortOpen(true)}
            onFilter={() => setFilterOpen(true)}
            sortValue={sortValue}
            filterLabel={filterLabel || '필터'}
            filterDescription={filterLabel || '모든 종류 · 전체 기간'}
            disabled={!isStorageReady}
          />
        }
      >
        {!isStorageReady || (items === undefined && !isError) ? <FeedPageSkeleton /> : items === undefined ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-theme-text-secondary">
            <span>기록을 불러오지 못했어요.</span>
            <button type="button" className="min-h-11 text-theme-accent" onClick={() => void refetch()}>다시 시도</button>
          </div>
        ) : (
          <FeedPageContent
            items={items}
            hasAppliedFilter={!!filterLabel}
            inViewRef={inViewRef}
            onRetry={isFetchNextPageError ? () => void fetchNextPage() : isError ? () => void refetch() : undefined}
          />
        )}
      </AppPageLayout>
      <AnimatePresence>
        {isSortOpen && (
          <SortPicker
            title="기록 정렬"
            value={sortValue}
            options={[
              { value: 'DESC', label: '최신순' },
              { value: 'ASC', label: '과거순' },
            ]}
            onClose={() => setSortOpen(false)}
            onApply={(value) => {
              if (value !== sortValue) {
                setSort(value);
                scrollToTop();
              }
              setSortOpen(false);
            }}
          />
        )}
        {isFilterOpen && (
          <FeedFilterPicker
            filters={filters}
            onClose={() => setFilterOpen(false)}
            onApply={applyFilters}
          />
        )}
      </AnimatePresence>
    </>
  );
}

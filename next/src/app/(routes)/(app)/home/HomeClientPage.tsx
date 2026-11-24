'use client';


import HomePageContent from "./_components/HomePageContent";
import HomePageSkeleton from "./_components/HomePageSkeleton";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { authAction } from "@/common/auth/authAction";
import { BottomSheet } from "@/common/components/ui/BottomSheet/BottomSheet";
import { BottomSheetBody } from "@/common/components/ui/BottomSheet/BottomSheetBody";
import { BottomSheetTitle } from "@/common/components/ui/BottomSheet/BottomSheetTitle";
import { usePrefetchPage } from "@/common/hooks/usePrefetchPage";
import { useStoredFilters } from "@/common/hooks/useStoredFilters";
import { statsQueries } from "@/common/queries/statsQueries";
import { AnimatePresence } from 'framer-motion';
import HomePage from './_components/HomePage';
import HomePageYearPicker from './_components/HomePageYearPicker';

const HomeClientPage = ({ initialDate }: { initialDate: string }) => {
  usePrefetchPage();
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const currentYear = Number(initialDate.slice(0, 4));
  const { value: selectedYear, setStoredValue: setSelectedYear, isStorageReady } =
    useStoredFilters('home-analysis', currentYear);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const handleApplyYear = (year: number) => {
    setSelectedYear(year);
    setIsYearPickerOpen(false);
  };

  const { data: availableYears, isPending: isYearsPending, isError: isYearsError, refetch: refetchYears } = useQuery({
    ...statsQueries.years(authAction),
  });

  const { data: diaryStats, isError: isDiaryStatsError, refetch: refetchDiaryStats } = useQuery({
    ...statsQueries.diary(selectedYear, authAction),
    enabled: isStorageReady && isAnalysisOpen,
  });

  const { data: habitStats, isError: isHabitStatsError, refetch: refetchHabitStats } = useQuery({
    ...statsQueries.habit(selectedYear, authAction),
    enabled: isStorageReady && isAnalysisOpen,
  });
  const isStatsPending = !isStorageReady || diaryStats === undefined || habitStats === undefined;
  const isStatsError = isStorageReady &&
    ((isDiaryStatsError && diaryStats === undefined) || (isHabitStatsError && habitStats === undefined));

  const years = useMemo(() => {
    if (!availableYears || availableYears.length === 0) {
      return [currentYear];
    }
    const yearSet = new Set([...availableYears, currentYear]);
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [availableYears, currentYear]);

  return (
    <>
      <HomePage initialDate={initialDate} onOpenAnalysis={() => setAnalysisOpen(true)} />
      <AnimatePresence>
        {isAnalysisOpen && <BottomSheet ariaLabel="기록 분석" onClose={() => setAnalysisOpen(false)}>
          <BottomSheetTitle title="기록 분석" />
          <BottomSheetBody showScrollFade>
            <div className="pb-[max(2rem,env(safe-area-inset-bottom))]">{isStatsError ? (
              <div className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-center text-theme-text-secondary">
                <span>홈 기록을 불러오지 못했어요.</span>
                <button type="button" className="text-theme-accent" onClick={() => {
                  if (isDiaryStatsError) void refetchDiaryStats();
                  if (isHabitStatsError) void refetchHabitStats();
                }}>다시 시도</button>
              </div>
            ) : isStatsPending ? (
              <HomePageSkeleton />
            ) : (
              <HomePageContent
                today={initialDate}
                selectedYear={selectedYear}
                onChangeYear={handleApplyYear}
                diaryStats={diaryStats}
                habitStats={habitStats}
                isDiaryStatsError={isDiaryStatsError}
                isHabitStatsError={isHabitStatsError}
                onRetryDiaryStats={() => { void refetchDiaryStats(); }}
                onRetryHabitStats={() => { void refetchHabitStats(); }}
                onOpenYearPicker={() => setIsYearPickerOpen(true)}
              />
            )}</div>
          </BottomSheetBody>
        </BottomSheet>}
      </AnimatePresence>
      <AnimatePresence>
        {isYearPickerOpen && (
          <HomePageYearPicker
            key="year-picker"
            onClose={() => setIsYearPickerOpen(false)}
            years={years}
            isPending={isYearsPending}
            isError={isYearsError}
            onRetry={() => { void refetchYears(); }}
            selectedYear={selectedYear}
            onApplyYear={handleApplyYear}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeClientPage;

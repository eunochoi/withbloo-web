'use client';


import HomePageContent from "./_components/HomePageContent";
import HomePageSkeleton from "./_components/HomePageSkeleton";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { authAction } from "@/common/auth/authAction";
import { PanelDialog } from "@/common/components/ui/Dialog/PanelDialog";
import { PanelBody } from "@/common/components/ui/Dialog/PanelDialog/PanelBody";
import { PanelHeader } from "@/common/components/ui/Dialog/PanelDialog/PanelHeader";
import { usePrefetchPage } from "@/common/hooks/usePrefetchPage";
import { statsQueries } from "@/common/queries/statsQueries";
import { AnimatePresence } from 'framer-motion';
import HomePage from './_components/HomePage';
import HomePageYearPicker from './_components/HomePageYearPicker';

const HomeClientPage = ({ initialDate }: { initialDate: string }) => {
  usePrefetchPage();
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const currentYear = Number(initialDate.slice(0, 4));
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryYear = Number(searchParams.get('year'));
  const selectedYear = Number.isInteger(queryYear) && queryYear >= 1900 && queryYear <= 2100 ? queryYear : currentYear;
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const handleApplyYear = (year: number) => {
    const params = new URLSearchParams(searchParams);

    if (year === currentYear) params.delete('year');
    else params.set('year', year.toString());

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setIsYearPickerOpen(false);
  };

  const { data: availableYears, isPending: isYearsPending, isError: isYearsError, refetch: refetchYears } = useQuery({
    ...statsQueries.years(authAction),
  });

  const { data: diaryStats, isError: isDiaryStatsError, refetch: refetchDiaryStats } = useQuery({
    ...statsQueries.diary(selectedYear, authAction),
  });

  const { data: habitStats, isError: isHabitStatsError, refetch: refetchHabitStats } = useQuery({
    ...statsQueries.habit(selectedYear, authAction),
  });
  const isStatsPending = diaryStats === undefined || habitStats === undefined;
  const isStatsError = (isDiaryStatsError && diaryStats === undefined) || (isHabitStatsError && habitStats === undefined);

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
        {isAnalysisOpen && <PanelDialog ariaLabel="기록 분석" onClose={() => setAnalysisOpen(false)}>
          <PanelHeader title="기록 분석" />
          <PanelBody showScrollFade>
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
          </PanelBody>
        </PanelDialog>}
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

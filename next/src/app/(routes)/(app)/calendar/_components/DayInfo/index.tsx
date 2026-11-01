'use client';

import type { DiaryData } from '@/common/actions/diary';
import { checkHabit, uncheckHabit } from '@/common/actions/habit';
import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { EMOTIONS } from '@/common/constants/emotions';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { useState } from 'react';
import DayInfoDiarySection from './DayInfoDiarySection';
import DayInfoHabitSection from './DayInfoHabitSection';
import DayInfoHeader from './DayInfoHeader';
import EmotionImage from '@/common/components/ui/EmotionImage';

interface Props {
  date: string;
  diaryData?: DiaryData | null;
  isDiaryPending: boolean;
  isDiaryPlaceholder: boolean;
  isDiaryError: boolean;
  onRetryDiary: () => void;
}

const DayInfo = ({
  date,
  diaryData,
  isDiaryPending,
  isDiaryPlaceholder,
  isDiaryError,
  onRetryDiary,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingHabitId, setPendingHabitId] = useState<number | null>(null);

  const {
    data: habitData,
    isPending: isHabitPending,
    isPlaceholderData: isHabitPlaceholder,
    isError: isHabitError,
    refetch: refetchHabits,
  } = useQuery({
    ...habitQueries.byDate(date, authAction),
    placeholderData: keepPreviousData,
  });

  const isPending = isDiaryPending || isHabitPending;

  const isTransitioning = isPending || isDiaryPlaceholder || isHabitPlaceholder;

  const emotion = diaryData ? EMOTIONS[diaryData.emotion] : undefined;

  const onToggleHabit = async (habitId: number, completed: boolean) => {
    if (isTransitioning || !habitData?.canEdit || pendingHabitId !== null) {
      return;
    }

    setPendingHabitId(habitId);

    try {
      if (completed) {
        await authAction(() =>
          uncheckHabit({
            habitId,
            date,
          }),
        );
      } else {
        await authAction(() =>
          checkHabit({
            habitId,
            date,
          }),
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['habits'] }),
        queryClient.invalidateQueries({
          queryKey: ['habit'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['diary'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['diary-habit', 'month'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['stats'],
        }),
      ]);
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : '습관 체크 변경 실패',
      );
    } finally {
      setPendingHabitId(null);
    }
  };

  const onOpenDiary = () => {
    if (diaryData?.id) {
      router.push(`/diary/${diaryData.id}`, {
        scroll: false,
      });
    }
  };

  const onAddDiary = () => {
    router.push(`/diary/new?date=${date}`, {
      scroll: false,
    });
  };

  return (
    <section className="box-border flex w-full flex-col gap-3 desktop:min-h-0 desktop:flex-1">
      <div className="hidden desktop:block">
        <DayInfoHeader date={date} emotion={emotion} />
      </div>
      {emotion && !isTransitioning && !isDiaryError && !isHabitError && (
        <div className="mx-auto flex w-16 flex-col gap-2 desktop:hidden">
          <EmotionImage
            emotion={emotion}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16"
          />
          <div className="mx-2 h-1 overflow-hidden rounded-full bg-theme-border">
            <div
              className="h-full bg-theme-accent"
              style={{
                width: `${habitData?.summary.total ? (habitData.summary.completed / habitData.summary.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
      {(isDiaryError || isHabitError) && !isTransitioning && (
        <button
          type="button"
          className="min-h-16 text-sm text-theme-danger"
          onClick={() => {
            if (isDiaryError) onRetryDiary();
            if (isHabitError) void refetchHabits();
          }}
        >
          기록을 불러오지 못했어요. 다시 시도
        </button>
      )}

      {!(isDiaryError || isHabitError) && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={date}
            className="desktop:flex desktop:min-h-0 desktop:flex-1 desktop:flex-col"
            initial={{
              opacity: 0,
              y: 4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
            transition={{
              duration: 0.18,
              ease: 'easeOut',
            }}
          >
            <fieldset
              disabled={isTransitioning}
              aria-busy={isTransitioning}
              className="m-0 flex min-w-0 flex-col gap-6 desktop:min-h-0 desktop:flex-1"
            >
              <DayInfoDiarySection
                diaryData={diaryData}
                isFuture={habitData?.isFuture === true}
                onAddDiary={onAddDiary}
                onOpenDiary={onOpenDiary}
              />

              <DayInfoHabitSection
                habitData={habitData}
                pendingHabitId={pendingHabitId}
                onToggleHabit={onToggleHabit}
              />
            </fieldset>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default DayInfo;

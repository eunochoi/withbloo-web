'use client';

import { authAction } from '@/common/auth/authAction';
import Wordmark from '@/common/components/ui/Wordmark';
import { DIARY_EMOTION_GROUPS } from '@/common/constants/diaryFilters';
import { getTodayString } from '@/common/functions/getTodayString';
import { diaryQueries } from '@/common/queries/diaryQueries';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import HomeAnalysisCard from './HomeAnalysisCard';
import HomeGreeting from './HomeGreeting';
import TodayRecordSection from './TodayRecordSection';
import negativeCat from '/public/img/cats/cat-blue-n.png';
import positiveCat from '/public/img/cats/cat-blue-p.png';
import neutralCat from '/public/img/cats/cat-blue.png';

const HomePage = ({
  initialDate,
  onOpenAnalysis,
  loading = false,
}: {
  initialDate: string;
  onOpenAnalysis?: () => void;
  loading?: boolean;
}) => {
  const [today, setToday] = useState(initialDate);
  useEffect(() => {
    const syncToday = () => setToday(getTodayString());
    syncToday();
    const interval = window.setInterval(syncToday, 30_000);
    window.addEventListener('focus', syncToday);
    document.addEventListener('visibilitychange', syncToday);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncToday);
      document.removeEventListener('visibilitychange', syncToday);
    };
  }, []);
  const diary = useQuery(diaryQueries.byDate(today, authAction));
  const emotion = diary.isError || diary.isPending ? -1 : (diary.data?.emotion ?? -1);
  const cat = (DIARY_EMOTION_GROUPS.positive.emotions as readonly number[]).includes(emotion)
    ? positiveCat
    : (DIARY_EMOTION_GROUPS.negative.emotions as readonly number[]).includes(emotion)
      ? negativeCat
      : neutralCat;

  return (
    <main className="h-dvh w-full overflow-hidden bg-theme-accent-light">
      <div className="flex h-full min-h-0 w-full flex-col justify-between gap-2 overflow-y-auto px-[5dvw] pt-8 pb-[calc(var(--mobileNav)+env(safe-area-inset-bottom)+1rem)] tablet:mx-auto tablet:max-w-[600px] tablet:px-9 tablet:pb-8 desktop:max-w-[900px] desktop:justify-center desktop:gap-16 desktop:px-14 desktop:py-8">
        <div className="shrink-0 tablet:hidden">
          <Wordmark className="text-[40px]" />
        </div>
        <div className="desktop:flex desktop:items-center desktop:justify-between desktop:gap-8">
          <HomeGreeting />
          <Image
            priority
            src={cat}
            alt="고양이 블루"
            sizes="(min-width: 1024px) 35vw, 1px"
            className="hidden h-auto w-[42%] max-w-[420px] object-contain desktop:block"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          {loading ? (
            <div
              className="grid grid-cols-3 rounded-2xl border border-theme-accent/20 bg-theme-surface py-4 animate-pulse motion-reduce:animate-none desktop:grid-cols-4 desktop:py-6"
              role="status"
              aria-label="오늘의 기록 불러오는 중"
              aria-busy="true"
            >
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className={`${index === 0 ? 'hidden desktop:flex' : 'flex'} min-w-0 flex-col items-center gap-2 px-2`} aria-hidden="true">
                  <div className="h-5 w-16 max-w-full rounded bg-theme-skeleton" />
                  <div className="h-14 w-14 rounded-full bg-theme-skeleton" />
                  <div className="h-4 w-20 max-w-full rounded bg-theme-skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <TodayRecordSection initialDate={today} />
          )}
          <HomeAnalysisCard onOpenAnalysis={onOpenAnalysis} />
        </div>
        <div className="flex flex-col items-center">
          <Image
            priority
            src={cat}
            alt="고양이 블루"
            sizes="(min-width: 480px) 400px, 80vw"
            className="block h-auto max-h-[25dvh] w-full max-w-[250px] object-contain tablet:max-h-[30dvh] desktop:hidden"
          />
          <span className="text-base text-center whitespace-pre-line text-theme-accent-deep">
            {'Bloom with Bloo & Blue.'}
          </span>
        </div>
      </div>
    </main>
  );
};

export default HomePage;

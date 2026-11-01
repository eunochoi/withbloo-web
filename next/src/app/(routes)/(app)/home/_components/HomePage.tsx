'use client';

import Wordmark from '@/common/components/ui/Wordmark';
import Image from 'next/image';

import HomeAnalysisCard from './HomeAnalysisCard';
import HomeGreeting from './HomeGreeting';
import TodayRecordSection from './TodayRecordSection';
import cat from '/public/img/bloolog/cats/cat-blue.png';

const HomePage = ({ initialDate, onOpenAnalysis, loading = false }: { initialDate: string; onOpenAnalysis?: () => void; loading?: boolean }) => (
  <main className="h-dvh w-full overflow-hidden bg-theme-accent-light">
    <div className="flex h-full min-h-0 w-full flex-col justify-between px-[5dvw] pt-8 pb-[calc(var(--mobileNav)+env(safe-area-inset-bottom)+1rem)] tablet:mx-auto tablet:max-w-[600px] tablet:px-9 tablet:pb-8 desktop:max-w-[1000px] desktop:overflow-y-auto desktop:px-14 desktop:py-8">
      <div className="shrink-0 tablet:hidden"><Wordmark className="text-[32px]" /></div>
      <HomeGreeting />
      <div className="flex min-w-0 flex-col gap-3">
        {loading ? <div className="h-40 animate-pulse rounded-2xl bg-theme-skeleton motion-reduce:animate-none" role="status" aria-label="오늘의 기록 불러오는 중" /> : <TodayRecordSection initialDate={initialDate} />}
        <HomeAnalysisCard onOpenAnalysis={onOpenAnalysis} />
      </div>
      <Image priority src={cat} alt="고양이 블루" sizes="(min-width: 1024px) 40vw, (min-width: 480px) 400px, 80vw" className="block h-auto max-h-[25dvh] w-full object-contain tablet:max-h-[30dvh] desktop:ml-auto desktop:w-auto desktop:max-w-full" />
    </div>
  </main>

);

export default HomePage;

import { StatisticsIcon } from '@/common/constants/appIcons';

const HomeAnalysisCard = ({ onOpenAnalysis }: { onOpenAnalysis?: () => void }) => (
  <button type="button" disabled={!onOpenAnalysis} onClick={onOpenAnalysis} className="flex w-full items-center gap-3 rounded-2xl border border-theme-accent/25 bg-theme-accent/15 px-4 py-4 text-left transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent">
    <StatisticsIcon className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-semibold">하루하루 쌓아온 나의 발자취</span>
      <span className="text-sm text-theme-text-secondary">감정 일기, 습관, 거리두기 흐름을 한눈에 파악해요.</span>
    </span>
  </button>
);

export default HomeAnalysisCard;

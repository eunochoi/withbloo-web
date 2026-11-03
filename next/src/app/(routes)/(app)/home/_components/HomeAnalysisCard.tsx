import { StatisticsIcon } from '@/common/constants/appIcons';

const HomeAnalysisCard = ({
  onOpenAnalysis,
}: {
  onOpenAnalysis?: () => void;
}) => (
  <button
    type="button"
    disabled={!onOpenAnalysis}
    onClick={onOpenAnalysis}
    className="flex w-full items-center gap-3 desktop:gap-5 rounded-2xl border border-theme-accent/25 bg-theme-accent/15 px-4 py-4 desktop:px-6 desktop:py-6 text-left transition-opacity hover:opacity-70"
  >
    <StatisticsIcon
      className="shrink-0 text-2xl desktop:text-3xl text-theme-accent"
      aria-hidden="true"
    />
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-semibold desktop:text-lg">하루하루 쌓아온 나의 발자취</span>
      <span className="tracking-tighter text-sm desktop:text-base text-theme-text-secondary">
        감정, 습관, 거리두기 흐름을 파악해요.
      </span>
    </span>
  </button>
);

export default HomeAnalysisCard;

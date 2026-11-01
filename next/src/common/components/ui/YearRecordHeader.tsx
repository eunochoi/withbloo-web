import { ChevronLeftIcon, ChevronRightIcon } from '@/common/constants/appIcons';

import { AppSectionHeader, AppSectionMeta, AppSectionTitle } from './AppSection';

interface Props {
  year: number;
  canPrevious?: boolean;
  canNext?: boolean;
  onPreviousYear: () => void;
  onCurrentYear: () => void;
  onNextYear: () => void;
}

export const YearRecordHeader = ({ year, onPreviousYear, onCurrentYear, onNextYear, canPrevious = true, canNext = true }: Props) => {
  return (
    <AppSectionHeader className="!gap-1 !py-0">
      <AppSectionTitle className="shrink-0 !text-xl">일기 기록</AppSectionTitle>
      <div className="flex shrink-0 items-center text-theme-accent">
        <button type="button" onClick={onPreviousYear} disabled={!canPrevious} aria-label="이전 연도" className="flex h-9 w-8 items-center justify-center disabled:opacity-30">
          <ChevronLeftIcon size={22} />
        </button>
        <button type="button" onClick={onCurrentYear} aria-label={`${year}년, 올해로 이동`} className="px-1 py-2">
          <AppSectionMeta>{year}년</AppSectionMeta>
        </button>
        <button type="button" onClick={onNextYear} disabled={!canNext} aria-label="다음 연도" className="flex h-9 w-8 items-center justify-center disabled:opacity-30">
          <ChevronRightIcon size={22} />
        </button>
      </div>
    </AppSectionHeader>
  );
};

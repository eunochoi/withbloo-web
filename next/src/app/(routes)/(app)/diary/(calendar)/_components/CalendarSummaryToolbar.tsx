'use client';

import Toolbar from '@/common/components/ui/Toolbar';
import ToolbarButton from '@/common/components/ui/ToolbarButton';
import { AddIcon, DiaryIcon, HabitIcon } from '@/common/constants/appIcons';

const CalendarSummaryToolbar = ({
  diaryCount = 0,
  counts = { high: 0, medium: 0, low: 0 },
  onAddDiary,
}: {
  diaryCount?: number;
  counts?: { high: number; medium: number; low: number };
  onAddDiary?: () => void;
}) => (
  <Toolbar alignToList className="gap-3 text-sm font-medium leading-snug text-theme-text-secondary tablet:gap-4">
    <span
      className="flex min-h-10 min-w-0 items-center gap-1.5 whitespace-nowrap pl-1"
      aria-label={`일기 ${diaryCount}개`}
    >
      <DiaryIcon size={18} className="shrink-0 text-theme-accent" aria-hidden="true" />
      {`${diaryCount}개`}
    </span>
    {([
      { key:'high', color:'#7BBDAD', label:'75% 이상' },
      { key:'medium', color:'#EFBE48', label:'25% 이상 75% 미만' },
      { key:'low', color:'#E599A5', label:'25% 미만' },
    ] as const).map(({ key, color, label }) => (
      <span
        key={key}
        className="flex min-h-10 min-w-0 items-center gap-1.5 whitespace-nowrap"
        aria-label={`습관 완료율 ${label}, ${counts[key]}일`}
      >
        <HabitIcon size={18} className="shrink-0" style={{ color }} aria-hidden="true" />
        {`${counts[key]}일`}
      </span>
    ))}
    <div className="-mr-3 ml-auto shrink-0">
      <ToolbarButton
        variant="listIcon"
        onClick={() => onAddDiary?.()}
        disabled={!onAddDiary}
        aria-label="일기 작성"
        title="일기 작성"
      >
        <AddIcon size={20} aria-hidden="true" />
      </ToolbarButton>
    </div>
  </Toolbar>
);

export default CalendarSummaryToolbar;

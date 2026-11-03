import Toolbar from'@/common/components/ui/Toolbar';
import { DiaryIcon, HabitIcon } from'@/common/constants/appIcons';

const CalendarSummaryToolbar = ({
  diaryCount = 0,
  counts = { high: 0, medium: 0, low: 0 },
}: {
  diaryCount?: number;
  counts?: { high: number; medium: number; low: number };
}) => (
  <Toolbar className="px-1 text-sm font-medium leading-snug text-theme-text-secondary">
    <span
      className="flex min-h-10 min-w-0 items-center gap-1.5 whitespace-nowrap"
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
  </Toolbar>
);

export default CalendarSummaryToolbar;

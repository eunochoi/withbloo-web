export function CalendarHabitProgress({ done, total }: { done: number; total: number }) {
  if (done <= 0 || total <= 0) return null;
  const progress = Math.min(100, Math.max(0, (done / total) * 100));
  const color = progress < 25 ? '#E599A5' : progress < 75 ? '#EFBE48' : '#7BBDAD';
  return (
    <span role="progressbar" aria-label="습관 진행률" aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={progress} aria-valuetext={`${done}/${total} 완료`}
      className="mx-auto block h-2 w-full overflow-hidden rounded-full bg-theme-border/80 tablet:max-w-[40px]">
      <span className="block h-full" style={{ width: `${progress}%`, backgroundColor: color }} />
    </span>
  );
}

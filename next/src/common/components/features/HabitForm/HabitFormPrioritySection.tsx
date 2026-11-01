import InfoNotice from '@/common/components/ui/InfoNotice';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitFormPickerRow from './HabitFormPickerRow';

const HabitFormPrioritySection = ({ priority, onOpen }: { priority: number; onOpen: () => void }) => (
  <section aria-labelledby="habit-priority-title" className="flex flex-col gap-3">
    <h2 id="habit-priority-title" className="text-lg font-semibold">우선순위</h2>
    <HabitFormPickerRow accessibilityLabel="우선순위 선택" label={priority === 0 ? '없음 · 자유 기록' : `${['', '낮음', '보통', '높음'][priority]} · 매일 기록`}
      leading={<HabitPriority priority={priority} className="gap-0.5 text-xl" />} onClick={onOpen} />
    {priority === 0 && <InfoNotice>완료율과 달성 개수 계산에는 포함되지 않아요.</InfoNotice>}
  </section>
);

export default HabitFormPrioritySection;

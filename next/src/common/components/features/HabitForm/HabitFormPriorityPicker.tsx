import { useState } from 'react';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitFormPicker from './HabitFormPicker';

const HabitFormPriorityPicker = ({ value, onApply, onClose }: { value: number; onApply: (value: number) => void; onClose: () => void }) => {
  const [draft, setDraft] = useState(value);
  return <HabitFormPicker id="habit-priority-picker-title" title="우선순위" onClose={onClose} onApply={() => onApply(draft)}>
    <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((priority) => (
      <button key={priority} type="button" aria-pressed={draft === priority} onClick={() => setDraft(priority)}
        className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-4 ${draft === priority ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent'}`}>
        <HabitPriority priority={priority} />
        <span className="text-sm text-theme-text-secondary">{priority === 0 ? '없음 · 자유 기록' : `${['', '낮음', '보통', '높음'][priority]} · 매일 기록`}</span>
      </button>
    ))}</div>
    <div className="pt-3"><InfoNotice>자유 기록 항목은 완료율과 달성 개수 계산에 포함되지 않아요.</InfoNotice></div>
  </HabitFormPicker>;
};

export default HabitFormPriorityPicker;

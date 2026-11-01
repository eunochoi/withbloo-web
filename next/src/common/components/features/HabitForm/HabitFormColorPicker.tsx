import { useState } from 'react';
import { HABIT_ICON_COLORS, resolveHabitIconColor, type HabitIconColorKey } from '@/common/constants/habitIconColors';
import HabitFormPicker from './HabitFormPicker';

const HabitFormColorPicker = ({ value, onApply, onClose }: { value: HabitIconColorKey; onApply: (value: HabitIconColorKey) => void; onClose: () => void }) => {
  const [draft, setDraft] = useState(value);
  return <HabitFormPicker fixedHeight id="habit-color-picker-title" title="아이콘 색상" onClose={onClose} onApply={() => onApply(draft)}>
    <div className="grid grid-cols-3 gap-1">
      {(['theme', ...Object.keys(HABIT_ICON_COLORS)] as HabitIconColorKey[]).map((key) => <button key={key} type="button" aria-pressed={draft === key} onClick={() => setDraft(key)}
        className={`flex aspect-[5/6] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border p-2 ${draft === key ? 'border-theme-accent bg-theme-accent/10 font-semibold text-theme-accent' : 'border-transparent text-theme-text-secondary'}`}>
        <span className="h-9 w-9 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: resolveHabitIconColor(key) }} />
        <span className="w-full text-center text-sm leading-5 tracking-tight">{key === 'theme' ? '기본' : HABIT_ICON_COLORS[key].label}</span>
      </button>)}
    </div>
  </HabitFormPicker>;
};

export default HabitFormColorPicker;

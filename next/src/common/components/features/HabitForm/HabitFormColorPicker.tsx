import { useState } from 'react';
import { HABIT_ICON_COLORS, resolveHabitIconColor, type HabitIconColorKey } from '@/common/constants/habitIconColors';
import HabitFormPicker from './HabitFormPicker';
import HabitIcon from '@/common/components/ui/HabitIcon';
import { SoberIcon } from '@/common/components/features/Sober/SoberIcon';
import { HABIT_ICON_LABELS } from '@/common/constants/habitIconLabels';
import { SOBER_ICONS } from '@/common/constants/sober';
import PickerInfoCard from '@/common/components/ui/PickerInfoCard';
import PickerGridItem from '@/common/components/ui/PickerGridItem';

const HabitFormColorPicker = ({ value, kind = 'habit', onApply, onClose }: { value: HabitIconColorKey; kind?: 'habit' | 'sober'; onApply: (value: HabitIconColorKey) => void; onClose: () => void }) => {
  const [draft, setDraft] = useState(value);
  return <HabitFormPicker fixedHeight scrollFade id="habit-color-picker-title" title="아이콘 색상" onClose={onClose} onApply={() => onApply(draft)} fixedContent={
    <div className="pb-4">
      <PickerInfoCard>
        {kind === 'habit' ? (
          (['water', 'walking', 'reading'] as const).map((name) => <div key={name} className="flex min-w-0 flex-1 flex-col items-center gap-4"><HabitIcon iconKey={name} iconColor={draft} className="text-3xl" /><span className="text-center text-sm font-normal text-theme-text-secondary">{HABIT_ICON_LABELS[name]}</span></div>)
        ) : (
          (['phone', 'coffee', 'shopping'] as const).map((name) => <div key={name} className="flex min-w-0 flex-1 flex-col items-center gap-4"><SoberIcon name={name} color={draft} className="h-9 w-9" /><span className="text-center text-sm font-normal text-theme-text-secondary">{SOBER_ICONS[name]}</span></div>)
        )}
      </PickerInfoCard>
    </div>
  }>
    <div className="grid grid-cols-3 gap-3">
      {(['theme', ...Object.keys(HABIT_ICON_COLORS)] as HabitIconColorKey[]).map((key) => <PickerGridItem key={key} label={key === 'theme' ? '기본' : HABIT_ICON_COLORS[key].label} selected={draft === key} onClick={() => setDraft(key)}>
        <span className="h-9 w-9 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: resolveHabitIconColor(key) }} />
      </PickerGridItem>)}
    </div>
  </HabitFormPicker>;
};

export default HabitFormColorPicker;

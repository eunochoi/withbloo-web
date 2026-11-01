import { format } from 'date-fns';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { HABIT_ICON_COLORS, resolveHabitIconColor, type HabitIconColorKey } from '@/common/constants/habitIconColors';
import HabitFormPickerRow from './HabitFormPickerRow';

const HabitFormRecordOptions = ({ iconColor, startedAtInput, isEdit, onOpenColor, onOpenDate }: {
  iconColor: HabitIconColorKey; startedAtInput: string; isEdit: boolean; onOpenColor: () => void; onOpenDate: () => void;
}) => (
  <>
    <section className="flex flex-col gap-3" aria-labelledby="habit-color-title">
      <h2 id="habit-color-title" className="text-lg font-semibold">아이콘 색상</h2>
      <HabitFormPickerRow accessibilityLabel="아이콘 색상 선택" label={iconColor === 'theme' ? '기본 테마색' : HABIT_ICON_COLORS[iconColor].label} onClick={onOpenColor}
        leading={<span className="h-6 w-6 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: resolveHabitIconColor(iconColor) }} />} />
    </section>
    <section className="flex flex-col gap-3" aria-labelledby="habit-start-title">
      <h2 id="habit-start-title" className="text-lg font-semibold">시작 일시</h2>
      <HabitFormPickerRow accessibilityLabel="시작 일시 선택" label={format(new Date(startedAtInput), 'yyyy년 M월 d일 HH:mm')} disabled={isEdit} onClick={onOpenDate} />
      <InfoNotice>시작 일시는 저장 후 변경할 수 없어요.</InfoNotice>
    </section>
  </>
);

export default HabitFormRecordOptions;

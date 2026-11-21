'use client';

import { useState } from 'react';
import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { BottomSheetPicker } from '@/common/components/ui/BottomSheet/BottomSheetPicker';
import { SheetSectionHeading } from '@/common/components/ui/BottomSheet/SheetSectionHeading';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { AchievementIcon, EditIcon, GoalIcon } from '@/common/constants/appIcons';
import { SOBER_GOALS, formatSoberGoal } from '@/common/functions/sober';

const sections = [
  { id: 'AUTO', icon: AchievementIcon, title: '자동 목표', hint: '목표를 달성하면 다음 기간으로 넘어가요.' },
  { id: 'PERIOD', icon: GoalIcon, title: '기간 설정', hint: '아래 기간 중 하나를 골라요.' },
  { id: 'CUSTOM', icon: EditIcon, title: '직접 입력', hint: '목표를 며칠로 할지 입력해요.' },
] as const;

export default function SoberGoalPicker({ mode, days, onApply, onClose }: {
  mode: 'AUTO' | 'MANUAL';
  days: number;
  onApply: (mode: 'AUTO' | 'MANUAL', days: number | null) => void;
  onClose: () => void;
}) {
  const savedPeriod = SOBER_GOALS.find((value) => value === days);
  const [selection, setSelection] = useState<'AUTO' | 'PERIOD' | 'CUSTOM'>(
    mode === 'AUTO' ? 'AUTO' : savedPeriod ? 'PERIOD' : 'CUSTOM',
  );
  const [period, setPeriod] = useState(savedPeriod ?? 7);
  const [customDays, setCustomDays] = useState(String(days || 7));
  const count = Number(customDays);
  const valid = /^\d+$/.test(customDays) && count >= 1 && count <= 36500;
  const canApply = selection !== 'CUSTOM' || valid;

  return (
    <BottomSheetPicker labelledBy="sober-goal-title" onClose={onClose} fixedHeight header={
      <header className="relative flex min-h-14 items-center justify-center px-12">
        <BottomSheetHeading id="sober-goal-title">목표 설정</BottomSheetHeading>
        <button type="button" disabled={!canApply}
          className="absolute right-0 min-h-11 text-lg font-normal text-theme-accent disabled:opacity-40"
          onClick={() => {
            if (!canApply) return;
            if (selection === 'AUTO') onApply('AUTO', null);
            else onApply('MANUAL', selection === 'PERIOD' ? period : count);
          }}>
          적용
        </button>
      </header>
    }>
      <div role="group" aria-labelledby="sober-goal-title"
        className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto overscroll-contain pb-6">
        {sections.map(({ id, icon, title, hint }) => {
          const active = selection === id;
          return (
            <section key={id} className="flex flex-col gap-4">
              <SheetSectionHeading icon={icon} title={title}
                toggle={{ checked: active, onChange: (checked) => setSelection(checked ? id : id === 'AUTO' ? 'PERIOD' : 'AUTO') }} />
              <fieldset disabled={!active} className={`flex min-w-0 flex-col gap-3 pl-7 ${active ? '' : 'opacity-40'}`}>
                <p className="text-sm leading-5 text-theme-text-secondary">{hint}</p>
                {id === 'AUTO' && <InfoNotice>{SOBER_GOALS.map(formatSoberGoal).join(' → ')}</InfoNotice>}
                {id === 'PERIOD' && (
                  <div className="grid grid-cols-3 gap-2">
                    {SOBER_GOALS.map((day) => (
                      <button key={day} type="button" aria-pressed={period === day} onClick={() => setPeriod(day)}
                        className={`min-h-12 rounded-xl border px-1 text-sm ${period === day ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border/70'}`}>
                        {formatSoberGoal(day)}
                      </button>
                    ))}
                  </div>
                )}
                {id === 'CUSTOM' && (
                  <>
                    <label className={`flex h-12 items-center gap-2 rounded-2xl border px-4 ${active && !valid ? 'border-theme-danger' : 'border-theme-border'}`}>
                      <input aria-label="직접 목표 일수" aria-invalid={active && !valid}
                        inputMode="numeric" maxLength={5} value={customDays}
                        onChange={(event) => setCustomDays(event.target.value)}
                        className="h-full min-w-0 flex-1 bg-transparent" />
                      <span className="text-sm text-theme-text-secondary">일</span>
                    </label>
                    {active && !valid && (
                      <p role="alert" className="text-sm text-theme-danger">
                        {count > 36500 ? '목표 기간이 너무 길어요. 더 짧게 입력해 주세요.' : '일수를 양의 정수로 입력해 주세요.'}
                      </p>
                    )}
                  </>
                )}
              </fieldset>
            </section>
          );
        })}
      </div>
    </BottomSheetPicker>
  );
}

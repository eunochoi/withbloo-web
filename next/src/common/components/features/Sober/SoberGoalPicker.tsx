'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { SOBER_GOALS, formatSoberGoal } from '@/common/functions/sober';
import {
  ChevronRightIcon,
  EditIcon,
  AchievementIcon,
  GoalIcon,
} from '@/common/constants/appIcons';

export default function SoberGoalPicker({
  mode,
  days,
  onApply,
  onClose,
}: {
  mode: 'AUTO' | 'MANUAL';
  days: number;
  onApply: (mode: 'AUTO' | 'MANUAL', days: number) => void;
  onClose: () => void;
}) {
  const [selection, setSelection] = useState<'AUTO' | 'PERIOD' | 'CUSTOM'>(
    mode === 'AUTO'
      ? 'AUTO'
      : SOBER_GOALS.some((value) => value === days)
        ? 'PERIOD'
        : 'CUSTOM',
  );
  const [draft, setDraft] = useState(String(days || 7));
  const [editor, setEditor] = useState<{
    kind: 'PERIOD' | 'CUSTOM';
    value: string;
  } | null>(null);
  const valid =
    editor !== null &&
    /^\d+$/.test(editor.value) &&
    Number(editor.value) >= 1 &&
    Number(editor.value) <= 36500;
  return (
    <>
      <PickerDialog
        labelledBy="sober-goal-title"
        onClose={() => {
          if (!editor) onClose();
        }}
      >
        <div className="flex flex-col gap-6 pb-6">
          <h2
            id="sober-goal-title"
            className="text-center text-lg font-semibold"
          >
            얼마 동안 거리를 두고 싶나요?
          </h2>
          <div className="flex flex-col gap-3">
            {(
              [
                {
                  key: 'AUTO',
                  icon: AchievementIcon,
                  title: '자동 목표',
                  hint: '거리를 두는 시간이 늘어나면 다음 목표가 자동으로 설정돼요.',
                  note: `* ${SOBER_GOALS.map(formatSoberGoal).join(' → ')}`,
                },
                {
                  key: 'PERIOD',
                  icon: GoalIcon,
                  title: '기간 선택',
                  hint: '거리를 두고 싶은 기간을 선택해요.',
                  note:
                    selection === 'PERIOD'
                      ? `선택한 목표: ${formatSoberGoal(Number(draft))}`
                      : '',
                },
                {
                  key: 'CUSTOM',
                  icon: EditIcon,
                  title: '직접 입력',
                  hint: '거리를 두고 싶은 기간을 일 단위로 입력해요.',
                  note: selection === 'CUSTOM' ? `선택한 목표: ${draft}일` : '',
                },
              ] as const
            ).map(({ key, icon: Icon, title, hint, note }) => (
              <button
                key={key}
                type="button"
                aria-pressed={selection === key}
                onClick={() =>
                  key === 'AUTO'
                    ? setSelection(key)
                    : setEditor({
                        kind: key,
                        value:
                          key === 'PERIOD' &&
                          !SOBER_GOALS.some((day) => day === Number(draft))
                            ? '7'
                            : draft,
                      })
                }
                className={`flex min-h-16 items-center gap-4 rounded-2xl border p-4 text-left ${selection === key ? 'border-theme-accent bg-theme-accent/10' : 'border-theme-border'}`}
              >
                <Icon className="shrink-0 text-2xl text-theme-accent" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-semibold">{title}</span>
                  <span className="text-sm text-theme-text-secondary">
                    {hint}
                  </span>
                  {note && (
                    <span className="text-xs text-theme-text-secondary">
                      {note}
                    </span>
                  )}
                </span>
                <ChevronRightIcon className="shrink-0 text-xl text-theme-text-secondary" />
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={editor !== null}
            onClick={() =>
              onApply(selection === 'AUTO' ? 'AUTO' : 'MANUAL', Number(draft))
            }
            className="min-h-12 rounded-full bg-theme-accent text-theme-text-on-accent disabled:opacity-40"
          >
            이 목표로 설정하기
          </button>
        </div>
      </PickerDialog>
      <AnimatePresence>
        {editor && (
          <PickerDialog
            labelledBy="sober-goal-editor"
            onClose={() => setEditor(null)}
          >
            <div className="flex flex-col gap-6 pb-6">
              <div className="relative flex min-h-11 items-center justify-center px-12">
              <h2
                id="sober-goal-editor"
                className="text-center text-lg font-semibold"
              >
                {editor.kind === 'PERIOD' ? '목표 기간 선택' : '목표 일수 입력'}
              </h2>
              <button
                type="button"
                disabled={!valid}
                onClick={() => {
                  if (!valid) return;
                  setSelection(editor.kind);
                  setDraft(String(Number(editor.value)));
                  setEditor(null);
                }}
                className="absolute right-0 min-h-11 px-2 text-lg font-normal text-theme-accent disabled:opacity-40"
              >
                완료
              </button>
              </div>
              {editor.kind === 'PERIOD' ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {SOBER_GOALS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={Number(editor.value) === day}
                      onClick={() =>
                        setEditor({ ...editor, value: String(day) })
                      }
                      className={`min-h-12 rounded-xl border text-sm ${Number(editor.value) === day ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border'}`}
                    >
                      {formatSoberGoal(day)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      aria-label="직접 목표 일수"
                      inputMode="numeric"
                      maxLength={5}
                      value={editor.value}
                      onChange={(event) =>
                        setEditor({ ...editor, value: event.target.value })
                      }
                      className="h-12 min-w-0 flex-1 rounded-2xl border border-theme-border bg-transparent px-4"
                    />
                    일
                  </label>
                  {!valid && (
                    <p role="alert" className="text-sm text-theme-danger">
                      1~36500일로 입력해주세요.
                    </p>
                  )}
                </div>
              )}

            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
    </>
  );
}

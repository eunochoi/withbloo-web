'use client';

import { SOBER_NAME_MAX_LENGTH } from '@/common/constants/sober';

import { saveSober } from '@/common/actions/sober';
import { authAction } from '@/common/auth/authAction';
import HabitFormColorPicker from '@/common/components/features/HabitForm/HabitFormColorPicker';
import HabitFormDatePicker from '@/common/components/features/HabitForm/HabitFormDatePicker';
import HabitFormPicker from '@/common/components/features/HabitForm/HabitFormPicker';
import HabitFormPickerRow from '@/common/components/features/HabitForm/HabitFormPickerRow';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { showNotice } from '@/common/components/ui/Notice/notice';
import {
  HABIT_ICON_COLORS,
  resolveHabitIconColor,
  type HabitIconColorKey,
} from '@/common/constants/habitIconColors';
import { SOBER_ICONS, SOBER_ICON_CATEGORIES } from '@/common/constants/sober';
import { formatSoberGoal } from '@/common/functions/sober';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import SoberGoalPicker from './SoberGoalPicker';
import { SoberIcon } from './SoberIcon';
import type { SoberWithRestarts } from './types';

export const SoberForm = ({
  item,
  onClose,
}: {
  item?: SoberWithRestarts;
  onClose: () => void;
}) => {
  const query = useQueryClient();
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [iconKey, setIconKey] = useState(item?.iconKey ?? 'favorite');
  const [color, setColor] = useState<HabitIconColorKey>(
    (item?.iconColor ?? 'theme') as HabitIconColorKey,
  );
  const [startedAt, setStartedAt] = useState(
    format(
      item ? new Date(item.initialStartedAt) : new Date(),
      "yyyy-MM-dd'T'HH:mm",
    ),
  );
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>(
    item?.goalMode === 'MANUAL' ? 'MANUAL' : 'AUTO',
  );
  const [goal, setGoal] = useState(item?.goalDays ?? 7);
  const [priority, setPriority] = useState(item?.isPriority ?? false);
  const [draftIcon, setDraftIcon] = useState(iconKey);
  const [category, setCategory] = useState<string>('basic');
  const [picker, setPicker] = useState<
    'icon' | 'color' | 'goal' | 'date' | null
  >(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const selectedCategory = useRef<HTMLButtonElement>(null);
  const iconGrid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (picker !== 'icon') return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'auto'
      : 'smooth';
    selectedCategory.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior,
    });
    iconGrid.current?.parentElement?.scrollTo({ top: 0, behavior });
  }, [category, picker]);

  const save = async () => {
    if (savingRef.current || !name.trim()) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await authAction(() =>
        saveSober({
          id: item?.id,
          name,
          description,
          iconKey,
          iconColor: color,
          isPriority: priority,
          initialStartedAt: item
            ? new Date(item.initialStartedAt).toISOString()
            : new Date(startedAt).toISOString(),
          goalMode: mode,
          goalDays: mode === 'MANUAL' ? goal : null,
        }),
      );
      await query.invalidateQueries({ queryKey: ['sober'] });
      showNotice(item ? '거리두기를 수정했어요' : '거리두기를 추가했어요');
      onClose();
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '저장하지 못했어요');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <PanelDialog
        ariaLabel={item ? '거리두기 수정' : '거리두기 추가'}
        onClose={onClose}
        dismissible={!saving}
      >
        <PanelHeader title={item ? '거리두기 수정' : '거리두기 추가'} headerRight={<PanelSubmitButton
            type="button"
            onClick={save}
            disabled={saving || !name.trim()}
            aria-busy={saving}
          >
            {saving ? '저장 중' : '저장'}
          </PanelSubmitButton>}
          />
        <PanelBody showScrollFade>
          <fieldset
            disabled={saving}
            className="m-0 flex min-w-0 flex-col gap-7 border-0 pb-8 pt-4"
          >
            <label className="flex min-h-12 items-center justify-between gap-3 text-lg font-semibold">
              중요 항목으로 저장
              <input
                type="checkbox"
                role="switch"
                checked={priority}
                onChange={(event) => setPriority(event.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5"
              />
            </label>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">거리를 두고 싶은 것</h3>
              <div className="space-y-3 px-1">
                <input
                  aria-label="거리두기 항목 이름"
                  value={name}
                  maxLength={SOBER_NAME_MAX_LENGTH}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="쇼츠 시청"
                  className="min-h-12 w-full border-0 bg-transparent p-0 text-base leading-8 outline-none placeholder:text-theme-text-tertiary"
                />
                <p className="text-right text-xs text-theme-text-secondary">
                  {name.length} / {SOBER_NAME_MAX_LENGTH}
                </p>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">아이콘</h3>
              <HabitFormPickerRow
                accessibilityLabel="아이콘 선택"
                label={SOBER_ICONS[iconKey as keyof typeof SOBER_ICONS]}
                onClick={() => {
                  setDraftIcon(iconKey);
                  setPicker('icon');
                }}
                leading={
                  <SoberIcon name={iconKey} color={color} className="h-7 w-7" />
                }
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">아이콘 색상</h3>
              <HabitFormPickerRow
                accessibilityLabel="아이콘 색상 선택"
                label={
                  color === 'theme'
                    ? '기본 테마색'
                    : HABIT_ICON_COLORS[color].label
                }
                onClick={() => setPicker('color')}
                leading={
                  <span
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ backgroundColor: resolveHabitIconColor(color) }}
                  />
                }
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">거리두기 목표</h3>
              <HabitFormPickerRow
                accessibilityLabel="목표 선택"
                label={mode === 'AUTO' ? '자동 목표' : formatSoberGoal(goal)}
                onClick={() => setPicker('goal')}
              />
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">시작 일시</h3>
              <HabitFormPickerRow
                accessibilityLabel="시작 일시 선택"
                label={format(new Date(startedAt), 'yyyy년 M월 d일 HH:mm')}
                disabled={!!item}
                onClick={() => setPicker('date')}
              />
              <InfoNotice>시작 일시는 저장 후 변경할 수 없어요.</InfoNotice>
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">나의 다짐 (선택)</h3>
              <div className="space-y-3 px-2">
                <textarea
                  aria-label="나의 다짐"
                  value={description}
                  maxLength={500}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="밤에는 속을 편하게 하기"
                  className="h-28 w-full resize-none border-0 bg-transparent p-0 text-base leading-8 placeholder:text-theme-text-tertiary"
                />
                <p className="text-right text-xs text-theme-text-secondary">
                  {description.length} / 500
                </p>
              </div>
            </section>
          </fieldset>
        </PanelBody>

      </PanelDialog>
      <AnimatePresence>
        {picker === 'date' && (
          <HabitFormDatePicker
            title="언제부터 거리를 두기 시작했나요?"
            value={startedAt}
            onClose={() => setPicker(null)}
            onApply={(value) => {
              setStartedAt(value);
              setPicker(null);
            }}
          />
        )}
        {picker === 'color' && (
          <HabitFormColorPicker
            value={color}
            onClose={() => setPicker(null)}
            onApply={(value) => {
              setColor(value);
              setPicker(null);
            }}
          />
        )}
        {picker === 'goal' && (
          <SoberGoalPicker
            mode={mode}
            days={goal}
            onClose={() => setPicker(null)}
            onApply={(value, days) => {
              setMode(value);
              setGoal(days);
              setPicker(null);
            }}
          />
        )}
        {picker === 'icon' && (
          <HabitFormPicker
            fixedHeight
            id="sober-icon-title"
            title="거리두기 아이콘"
            onClose={() => setPicker(null)}
            onApply={() => {
              setIconKey(draftIcon);
              setPicker(null);
            }}
            fixedContent={
              <div className="shrink-0 space-y-3">
                <div
                  className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1"
                  role="tablist"
                  aria-label="아이콘 분류"
                >
                  {SOBER_ICON_CATEGORIES.map((entry) => (
                    <button
                      key={entry.id}
                      ref={category === entry.id ? selectedCategory : undefined}
                      type="button"
                      role="tab"
                      aria-selected={category === entry.id}
                      onClick={() => setCategory(entry.id)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm ${category === entry.id ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-transparent text-theme-text-secondary'}`}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
                <p className="whitespace-pre-line text-center text-xs leading-4 text-theme-text-secondary">
                  {
                    SOBER_ICON_CATEGORIES.find((entry) => entry.id === category)
                      ?.description
                  }
                </p>
              </div>
            }
          >
            <div ref={iconGrid} className="grid grid-cols-3 gap-3">
              {SOBER_ICON_CATEGORIES.find(
                (entry) => entry.id === category,
              )?.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={draftIcon === key}
                  onClick={() => setDraftIcon(key)}
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-2 ${draftIcon === key ? 'border-theme-accent bg-theme-accent-light/50' : 'border-transparent'}`}
                >
                  <SoberIcon name={key} color={color} />
                  <span className="text-center text-sm">
                    {SOBER_ICONS[key]}
                  </span>
                </button>
              ))}
            </div>
          </HabitFormPicker>
        )}
      </AnimatePresence>
    </>
  );
};

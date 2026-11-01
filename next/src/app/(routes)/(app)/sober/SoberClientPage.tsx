'use client';

import { authAction } from '@/common/auth/authAction';
import HabitFormPickerRow from '@/common/components/features/HabitForm/HabitFormPickerRow';
import SoberCard from '@/common/components/features/Sober/SoberCard';
import AppPageLayout from '@/common/components/layout/AppPageLayout';
import AppPageTitle from '@/common/components/layout/AppPageTitle';
import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import EmptyStateCard from '@/common/components/ui/EmptyStateCard';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { showNotice } from '@/common/components/ui/Notice/notice';
import SortPicker from '@/common/components/ui/SortPicker';
import Toolbar from '@/common/components/ui/Toolbar';
import ToolbarButton from '@/common/components/ui/ToolbarButton';
import { AddIcon, FilterIcon, SortIcon } from '@/common/constants/appIcons';
import { getSoberSummary, SOBER_DAY_MS, sortSobers } from '@/common/functions/sober';
import { soberQueries } from '@/common/queries/soberQueries';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SoberDurationChart from './_components/SoberDurationChart';

export default function SoberClientPage() {
  const { data: items, isPending, isError, refetch } = useQuery(soberQueries.list(authAction));
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  const [picker, setPicker] = useState<'sort' | 'filter' | null>(null);
  const [sort, setSort] = useState<'DESC' | 'ASC'>('DESC');
  const [recordSort, setRecordSort] = useState<'DESC' | 'ASC'>('DESC');
  const [priority, setPriority] = useState(false);
  const [priorityFirst, setPriorityFirst] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [minDays, setMinDays] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('took:sober-sort') ?? '{}');
      if (['DESC', 'ASC'].includes(saved.sort)) setSort(saved.sort);
      if (['DESC', 'ASC'].includes(saved.recordSort)) {
        setRecordSort(saved.recordSort);
      } else if (saved.sort === 'SHORT') {
        setRecordSort('ASC');
      }
      if (typeof saved.priorityFirst === 'boolean') setPriorityFirst(saved.priorityFirst);
    } catch { }
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (preferencesReady) {
      localStorage.setItem('took:sober-sort', JSON.stringify({ sort, priorityFirst, recordSort }));
    }
  }, [sort, priorityFirst, recordSort, preferencesReady]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const ordered = sortSobers(items ?? [], { sort, priorityFirst, recordSort }, now);
  const filtered = ordered.filter((entry) => (
    (!priority || entry.isPriority)
    && getSoberSummary(entry, entry.restarts, now).current.duration >= minDays * SOBER_DAY_MS
  ));
  const sortLabel = [
    priorityFirst ? '중요' : '',
    recordSort === 'ASC' ? '짧은 기록' : '',
    sort === 'ASC' ? '과거' : '',
  ].filter(Boolean).join(' · ') || '정렬';
  const filterLabel = [
    priority ? '중요' : '',
    minDays
      ? ({ 3: '3일+', 7: '1주+', 14: '2주+', 30: '1개월+', 90: '3개월+' } as Record<number, string>)[minDays]
      : '',
  ].filter(Boolean).join(' · ') || '필터';

  return (
    <>
      <AppPageLayout
        header={<AppPageTitle title="거리두기" hashtags="#절제 #디톡스" />}
        toolbar={(
          <Toolbar>
            <ToolbarButton onClick={() => setPicker('sort')} aria-label="거리두기 정렬">
              <SortIcon size={18} />
              {sortLabel}
            </ToolbarButton>
            <ToolbarButton onClick={() => setPicker('filter')} aria-label="거리두기 필터">
              <FilterIcon size={18} />
              {filterLabel}
            </ToolbarButton>
            <div className="ml-auto">
              <ToolbarButton
                onClick={() => {
                  if (items && items.length >= 10) {
                    showNotice('거리두기는 최대 10개까지 만들 수 있어요.');
                  } else {
                    router.push('/sober/new', { scroll: false });
                  }
                }}
                disabled={!items}
                aria-label="거리두기 추가"
              >
                <AddIcon size={20} />
              </ToolbarButton>
            </div>
          </Toolbar>
        )}
      >
        <section className="grid w-full gap-6 desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:items-start desktop:gap-x-8">
          <div className="min-w-0">
            {isPending ? (
              <p role="status" className="py-20 text-center text-theme-text-secondary">
                기록을 불러오는 중이에요.
              </p>
            ) : isError ? (
              <div className="space-y-3 py-20 text-center">
                <p>거리두기 목록을 불러오지 못했어요.</p>
                <button type="button" onClick={() => void refetch()} className="text-theme-accent">
                  다시 시도
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyStateCard
                title={items?.length ? '선택한 조건의 거리두기가 없어요.' : '아직 시작한 거리두기가 없어요.'}
                description={items?.length ? '필터 조건을 바꿔보세요.' : '잠시 거리를 두고 싶은 것을 추가해보세요.'}
              />
            ) : (
              <>
                {filtered.map((entry) => (
                  <SoberCard
                    key={entry.id}
                    item={entry}
                    now={now}
                  />
                ))}
              </>
            )}
            {items && items.length > 0 && items.length < 10 && (
              <button
                type="button"
                onClick={() => router.push('/sober/new', { scroll: false })}
                aria-label="거리두기 추가"
                className={`flex h-44 w-full flex-col items-center justify-center gap-2 px-2 py-5 text-theme-accent ${filtered.length === 0 ? 'border-t border-theme-border/50' : ''}`}
              >
                <AddIcon className="text-[2rem]" aria-hidden="true" />
                <span className="text-xs text-theme-text-tertiary">({items.length}/10)</span>
              </button>
            )}
          </div>
          {!isPending && !isError && <SoberDurationChart items={filtered} now={now} />}
        </section>
      </AppPageLayout>

      <AnimatePresence>
        {picker === 'sort' && (
          <SortPicker
            title="거리두기 정렬"
            value={sort}
            priorityFirst={priorityFirst}
            recordSort={recordSort}
            options={[{ value: 'DESC', label: '최신순' }, { value: 'ASC', label: '과거순' }]}
            onClose={() => setPicker(null)}
            onApply={(value, important, records) => {
              setRecordSort(records ?? 'DESC');
              setSort(value);
              setPriorityFirst(important);
              setPicker(null);
            }}
          />
        )}
        {picker === 'filter' && (
          <SoberFilterPicker
            priority={priority}
            minDays={minDays}
            onClose={() => setPicker(null)}
            onApply={(important, days) => {
              setPriority(important);
              setMinDays(days);
              setPicker(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface SoberFilterPickerProps {
  priority: boolean;
  minDays: number;
  onClose: () => void;
  onApply: (priority: boolean, days: number) => void;
}

function SoberFilterPicker({ priority, minDays, onClose, onApply }: SoberFilterPickerProps) {
  const [important, setImportant] = useState(priority);
  const [days, setDays] = useState(minDays);
  const [periodOpen, setPeriodOpen] = useState(false);
  const periods = [
    { days: 0, label: '전체' },
    { days: 3, label: '3일 이상' },
    { days: 7, label: '1주 이상' },
    { days: 14, label: '2주 이상' },
    { days: 30, label: '1개월 이상' },
    { days: 90, label: '3개월 이상' },
  ];

  return (
    <>
      <PickerDialog
        labelledBy="sober-filter-title"
        onClose={() => { if (!periodOpen) onClose(); }}
      >
        <div className="flex flex-col gap-7 pb-6">
          <div className="relative flex min-h-10 items-center justify-center">
            <h2 id="sober-filter-title" className="text-lg font-semibold">거리두기 필터</h2>
            <button
              type="button"
              onClick={() => { setImportant(false); setDays(0); }}
              className="absolute right-0 min-h-10 text-sm text-theme-accent"
            >
              초기화
            </button>
          </div>
          <label className="flex min-h-12 items-center justify-between gap-3 font-semibold">
            중요한 항목만 보기
            <input
              type="checkbox"
              role="switch"
              checked={important}
              onChange={(event) => setImportant(event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-theme-accent"
            />
          </label>
          <section className="space-y-4">
            <h3 className="font-semibold">최소 유지 기간</h3>
            <HabitFormPickerRow
              label={periods.find((entry) => entry.days === days)?.label ?? '전체'}
              accessibilityLabel="최소 유지 기간 선택"
              onClick={() => setPeriodOpen(true)}
            />
          </section>
          <InfoNotice>현재 기록이 선택한 기간 이상인 항목만 보여요.</InfoNotice>
          <button
            type="button"
            onClick={() => onApply(important, days)}
            className="min-h-12 rounded-full bg-theme-accent text-theme-text-on-accent"
          >
            적용하기
          </button>
        </div>
      </PickerDialog>

      <AnimatePresence>
        {periodOpen && (
          <PickerDialog labelledBy="sober-period-title" onClose={() => setPeriodOpen(false)}>
            <div className="flex flex-col gap-3 pb-6">
              <h2 id="sober-period-title" className="mb-3 text-center text-lg font-semibold">
                최소 유지 기간
              </h2>
              {periods.map((entry) => (
                <button
                  key={entry.days}
                  type="button"
                  aria-label={`현재 기록 ${entry.label}`}
                  aria-pressed={entry.days === days}
                  onClick={() => { setDays(entry.days); setPeriodOpen(false); }}
                  className={`min-h-12 rounded-xl border ${entry.days === days ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border'}`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
    </>
  );
}

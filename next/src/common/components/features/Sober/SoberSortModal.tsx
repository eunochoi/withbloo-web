'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton';
import InfoNotice from '@/common/components/ui/InfoNotice';
import ScrollableName from '@/common/components/ui/ScrollableName';
import { DragIcon, StarIcon } from '@/common/constants/appIcons';
import { sortSobers } from '@/common/functions/sober';
import { SoberIcon } from './SoberIcon';
import type { SoberWithRestarts } from './types';

type Sort = 'ASC' | 'DESC' | 'CUSTOM';
const radioClass = 'h-5 w-5 shrink-0 appearance-none rounded-full border border-theme-accent bg-theme-surface checked:bg-theme-accent checked:shadow-[inset_0_0_0_3px_rgb(var(--theme-surface))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent';

function SoberSortItem({ item }: { item: SoberWithRestarts }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null), transition }} className={`flex h-16 w-full min-w-0 items-center gap-3 rounded-xl p-4 text-sm ${isDragging ? 'relative z-10 bg-theme-accent/10' : ''}`}>
      <SoberIcon name={item.iconKey} color={item.iconColor} className="h-8 w-8" />
      <span className="min-w-0 flex-1"><ScrollableName name={item.name} className="font-medium" /></span>
      {item.isPriority && <StarIcon className="shrink-0 text-theme-accent" aria-label="중요" />}
      <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} aria-label={`${item.name} 순서 변경`} className="-m-4 flex h-12 w-12 shrink-0 touch-none items-center justify-center p-3 text-theme-accent-deep"><DragIcon className="text-xl" /></button>
    </div>
  );
}

export function SoberSortModal({ items, isError, onRetry, sort, recordSort, priorityFirst, customOrder, now, onClose, onApply }: {
  items?: SoberWithRestarts[]; isError: boolean; onRetry: () => void; sort: Sort; recordSort: 'ASC' | 'DESC'; priorityFirst: boolean; customOrder: number[]; now: number;
  onClose: () => void; onApply: (sort: Sort, priority: boolean, recordSort: 'ASC' | 'DESC', order: number[]) => void;
}) {
  const [mounted, setMounted] = useState(true);
  const [draftSort, setSort] = useState<Sort>(sort);
  const [standardSort, setStandardSort] = useState<'ASC' | 'DESC'>(sort === 'CUSTOM' ? 'DESC' : sort);
  const [records, setRecords] = useState(recordSort);
  const [priority, setPriority] = useState(priorityFirst);
  const [order, setOrder] = useState<SoberWithRestarts[] | null>(() => items ? sortSobers(items, { sort: 'CUSTOM', customOrder }, now) : null);
  const [, setReset] = useState(false);
  useEffect(() => { if (items) setOrder((current) => current ?? sortSobers(items, { sort: 'CUSTOM', customOrder }, now)); }, [items, customOrder, now]);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const defaults = [...(items ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || a.id - b.id);
  const ids = (order ?? []).map((item) => item.id);
  const isDefault = ids.length === defaults.length && ids.every((id, i) => defaults[i].id === id);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!order || !over || active.id === over.id) return;
    const from = order.findIndex((item) => item.id === active.id);
    const to = order.findIndex((item) => item.id === over.id);
    if (from >= 0 && to >= 0) setOrder(arrayMove(order, from, to));
  };
  const options = (value: 'ASC' | 'DESC', setValue: (value: 'ASC' | 'DESC') => void, labels: [string, string]) => (
    <div className="flex gap-3">{(['DESC', 'ASC'] as const).map((choice, index) => <button key={choice} type="button" aria-pressed={value === choice} onClick={() => setValue(choice)} className={`min-h-12 flex-1 rounded-xl border px-1 py-3 ${value === choice ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border/70'}`}>{labels[index]}</button>)}</div>
  );
  return <AnimatePresence onExitComplete={onClose}>{mounted && <PanelDialog ariaLabel="거리두기 정렬 설정" onClose={() => setMounted(false)}>
    <PanelHeader title="거리두기 정렬" onBack={() => setMounted(false)} headerLeft={<button type="button" aria-label="선택 초기화" disabled={draftSort === 'CUSTOM' && !items} onClick={() => { if (draftSort === 'CUSTOM') { setOrder(defaults); setReset(true); } else { setSort('DESC'); setStandardSort('DESC'); setRecords('DESC'); setPriority(false); } }} className="min-h-11 text-lg font-normal text-theme-text-secondary/70 disabled:opacity-40">초기화</button>} headerRight={<PanelSubmitButton type="button" disabled={draftSort === 'CUSTOM' && !order} onClick={() => { onApply(draftSort, draftSort === 'CUSTOM' ? false : priority, records, draftSort === 'CUSTOM' ? (isDefault ? [] : ids) : customOrder); setMounted(false); }}>적용</PanelSubmitButton>} />
    <PanelBody showScrollFade><div className="flex min-w-0 w-full flex-col pb-6">
      <section className="flex min-w-0 flex-col gap-5 pb-8">
        <label className="flex cursor-pointer items-center gap-2 text-lg font-semibold"><input type="radio" name="sober-sort-mode" checked={draftSort !== 'CUSTOM'} onChange={() => setSort(standardSort)} className={radioClass} />기준별 정렬</label>
        <fieldset disabled={draftSort === 'CUSTOM'} className={`flex min-w-0 flex-col gap-5 p-2 ${draftSort === 'CUSTOM' ? 'opacity-40' : ''}`}>
          <label className="flex items-center justify-between gap-3 text-base font-semibold">중요한 항목 먼저<input type="checkbox" role="switch" checked={priority} onChange={(event) => setPriority(event.target.checked)} className="peer sr-only" /><span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5" /></label>
          <section className="flex flex-col gap-3"><h3 className="text-base font-semibold">기록 정렬</h3>{options(records, setRecords, ['긴 기록순', '짧은 기록순'])}</section>
          <section className="flex flex-col gap-3"><h3 className="text-base font-semibold">생성일 정렬</h3>{options(standardSort, (value) => { setStandardSort(value); setSort(value); }, ['최신순', '과거순'])}</section>
          <InfoNotice>{priority ? '중요도, ' : ''}현재 기록, 생성일 순으로 정렬해요.</InfoNotice>
        </fieldset>
      </section>
      <section className="flex min-w-0 flex-col gap-5 border-t border-theme-border/30 pt-8">
        <label className="flex cursor-pointer items-center gap-2 text-lg font-semibold"><input type="radio" name="sober-sort-mode" checked={draftSort === 'CUSTOM'} onChange={() => setSort('CUSTOM')} className={radioClass} />자유 정렬</label>
        <fieldset disabled={draftSort !== 'CUSTOM'} className={`flex min-w-0 flex-col gap-5 p-2 ${draftSort !== 'CUSTOM' ? 'opacity-40' : ''}`}>
          {draftSort === 'CUSTOM' && !items && (isError ? <div className="py-4 text-center text-sm text-theme-text-secondary">거리두기를 불러오지 못했어요. <button type="button" onClick={onRetry} className="text-theme-accent">다시 시도</button></div> : <p role="status" className="py-4 text-center text-sm text-theme-text-secondary">거리두기를 불러오는 중이에요.</p>)}
          {order && <div className="w-full min-w-0 rounded-xl bg-theme-bg" inert={draftSort !== 'CUSTOM'}><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToParentElement, restrictToVerticalAxis]}><SortableContext items={ids} strategy={verticalListSortingStrategy}>{order.map((item) => <SoberSortItem key={item.id} item={item} />)}</SortableContext></DndContext></div>}
          <InfoNotice>직접 정한 순서로 보여드려요.</InfoNotice>
        </fieldset>
      </section>
    </div></PanelBody>
  </PanelDialog>}</AnimatePresence>;
}

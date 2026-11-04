'use client';

import Toolbar from '@/common/components/ui/Toolbar';

import { AddIcon, FilterIcon, SortIcon } from '@/common/constants/appIcons';

import ToolbarButton from '@/common/components/ui/ToolbarButton';
import ToolbarSelectionButton from '@/common/components/ui/ToolbarSelectionButton';
import { getSelectionSummary, getToolbarSortParts } from '@/common/functions/toolbarSummary';
import type { HabitSort } from '@/common/types/sort';



interface Props {
  onToggle: () => void;
  onOpenFilter: () => void;
  completedOnly: boolean;
  priorities: number[];
  onAddHabit: () => void;
  sortValue: HabitSort;
  priorityFirst: boolean;
  disabledAdd?: boolean;
}

const HabitPageToolbar = ({ onToggle, onOpenFilter, completedOnly, priorities, onAddHabit, sortValue, priorityFirst, disabledAdd = false }: Props) => {
  const filterParts = [
    ...(completedOnly ? ['완료'] : []),
    ...(priorities.length > 0 && priorities.length < 4 ? priorities.map((priority) => priority === 0 ? '자유' : <span key={priority} className="text-theme-accent">{'★'.repeat(priority)}</span>) : []),
  ];
  const showPriority = sortValue !== 'CUSTOM' && priorityFirst;
  const sortDescription = sortValue === 'CUSTOM' ? '자유' : `${showPriority ? '중요한 항목 먼저 · ' : ''}생성일 ${sortValue === 'DESC' ? '최신순' : '과거순'}`;
  const filterDescription = `${completedOnly ? '오늘 완료' : '완료 상태 전체'}, 중요도 ${getSelectionSummary(priorities.map((priority) => priority === 0 ? '자유 기록' : '★'.repeat(priority)), 4)}`;
  return (
    <Toolbar>
      <ToolbarSelectionButton onClick={onToggle} icon={<SortIcon size={18} aria-hidden="true" />} parts={getToolbarSortParts(sortValue, priorityFirst)} accessibilityLabel={`습관 정렬, ${sortDescription}`} />
      <ToolbarSelectionButton onClick={onOpenFilter} icon={<FilterIcon size={18} aria-hidden="true" />} parts={filterParts.length ? filterParts : ['필터']} accessibilityLabel={`습관 필터, ${filterDescription}`} />
      <div className="ml-auto shrink-0">
        <ToolbarButton aria-label="습관 추가" onClick={onAddHabit} title="습관 추가" disabled={disabledAdd}><AddIcon size={18} aria-hidden="true" /></ToolbarButton>
      </div>
    </Toolbar>
  );
};

export default HabitPageToolbar;

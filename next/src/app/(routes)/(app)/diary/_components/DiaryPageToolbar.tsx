'use client';

import Toolbar from '@/common/components/ui/Toolbar';

import { AddIcon, FilterIcon, SortIcon } from '@/common/constants/appIcons';

import ToolbarButton from '@/common/components/ui/ToolbarButton';
import ToolbarSelectionButton from '@/common/components/ui/ToolbarSelectionButton';
import { getToolbarSortParts } from '@/common/functions/toolbarSummary';
import type { DiarySort } from '@/common/types/sort';


interface Props {
  onSort: () => void;
  onFilter: () => void;
  onAdd: () => void;
  sortValue: DiarySort;
  filterLabel: string;
  filterDescription: string;
  disabled?: boolean;
}

const DiaryPageToolbar = ({ onSort, onFilter, onAdd, sortValue, filterLabel, filterDescription, disabled = false }: Props) => (
  <Toolbar>
    <ToolbarSelectionButton onClick={onSort} disabled={disabled} icon={<SortIcon size={18} aria-hidden="true" />} parts={getToolbarSortParts(sortValue)} accessibilityLabel={`일기 정렬, 날짜 ${sortValue === 'DESC' ? '최신순' : '과거순'}`} />
    <ToolbarSelectionButton onClick={onFilter} disabled={disabled} icon={<FilterIcon size={18} aria-hidden="true" />} parts={filterLabel.split(' · ')} accessibilityLabel={`일기 필터, ${filterDescription}`} />
    <div className="ml-auto shrink-0"><ToolbarButton onClick={onAdd} disabled={disabled} aria-label="일기 추가"><AddIcon size={20} aria-hidden="true" /></ToolbarButton></div>
  </Toolbar>
);

export default DiaryPageToolbar;

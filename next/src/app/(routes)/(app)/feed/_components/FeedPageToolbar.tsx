'use client';

import Toolbar from '@/common/components/ui/Toolbar';

import { FilterIcon, SortIcon } from '@/common/constants/appIcons';

import ToolbarSelectionButton from '@/common/components/ui/ToolbarSelectionButton';
import { getToolbarSortParts } from '@/common/functions/toolbarSummary';
import type { DiarySort } from '@/common/types/sort';


interface Props {
  onSort: () => void;
  onFilter: () => void;
  sortValue: DiarySort;
  filterLabel: string;
  filterDescription: string;
  disabled?: boolean;
}

const FeedPageToolbar = ({ onSort, onFilter, sortValue, filterLabel, filterDescription, disabled = false }: Props) => (
  <Toolbar alignToList>
    <ToolbarSelectionButton onClick={onSort} disabled={disabled} icon={<SortIcon size={18} aria-hidden="true" />} parts={getToolbarSortParts(sortValue)} accessibilityLabel={`기록 정렬, 날짜 ${sortValue === 'DESC' ? '최신순' : '과거순'}`} />
    <ToolbarSelectionButton onClick={onFilter} disabled={disabled} icon={<FilterIcon size={18} aria-hidden="true" />} parts={filterLabel.split(' · ')} accessibilityLabel={`기록 필터, ${filterDescription}`} />
  </Toolbar>
);

export default FeedPageToolbar;

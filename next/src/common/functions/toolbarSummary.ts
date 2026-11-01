import type { HabitSort } from '../types/sort';

export const getToolbarSortParts = (sort: HabitSort, priorityFirst = false): string[] => {
  if (sort === 'CUSTOM') return ['커스텀'];
  const parts = [priorityFirst ? '중요' : '', sort === 'ASC' ? '과거' : ''].filter(Boolean);
  return parts.length ? parts : ['정렬'];
};

export const getSelectionSummary = (labels: string[], optionCount: number, allLabel = '전체'): string =>
  labels.length === 0 || labels.length === optionCount ? allLabel : labels.join(' · ');

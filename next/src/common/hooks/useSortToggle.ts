import { useCallback } from 'react';
import {
  DEFAULT_SORT_BY_KEY,
  SORT_OPTIONS_BY_KEY,
  SortableSortKey,
  SortPreferences,
  SortValueByKey,
} from '../types/sort';
import { useCurrentUser } from './useCurrentUser';
import { useLocalStorage } from './useLocalStorage';

interface UseSortToggleProps<K extends SortableSortKey> {
  sortKey: K;
}

interface UseSortToggleResult<K extends SortableSortKey> {
  sortValue: SortValueByKey[K];
  onToggle: () => void;
  setSort: (value: SortValueByKey[K]) => void;
}

export const useSortToggle = <K extends SortableSortKey>(
  { sortKey }: UseSortToggleProps<K>,
): UseSortToggleResult<K> => {
  const { data: user } = useCurrentUser();
  const storageKey = `took:${user?.email}:sort`;

  const {
    value: sortPreferences,
    setStoredValue: setSortPreferences,
  } = useLocalStorage<SortPreferences>(storageKey, {});

  const sortValue = (
    sortPreferences[sortKey] ?? DEFAULT_SORT_BY_KEY[sortKey]
  ) as SortValueByKey[K];

  const onToggle = useCallback(() => {
    const options = SORT_OPTIONS_BY_KEY[sortKey];

    setSortPreferences((prev) => {
      const currentValue = prev[sortKey] ?? DEFAULT_SORT_BY_KEY[sortKey];
      const currentIndex = options.findIndex((option) => option === currentValue);
      const nextIndex = (currentIndex + 1) % options.length;

      return {
        ...prev,
        [sortKey]: options[nextIndex],
      };
    });
  }, [setSortPreferences, sortKey]);

  const setSort = useCallback((value: SortValueByKey[K]) => {
    setSortPreferences((previous) => ({ ...previous, [sortKey]: value }));
  }, [setSortPreferences, sortKey]);

  return { sortValue, onToggle, setSort };
};

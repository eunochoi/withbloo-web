import { useCurrentUser } from "@/common/hooks/useCurrentUser";
import { useLocalStorage } from "@/common/hooks/useLocalStorage";
import { DEFAULT_SORT_BY_KEY, HABIT_SORT_OPTIONS, SortPreferences } from "@/common/types/sort";
import { useCallback, useEffect, useRef } from "react";

const HABIT_ORDER_CHANGED_EVENT = 'took:habit-order-changed';

interface HabitOrderChangedDetail {
  key: string;
  order: number[];
  source: symbol;
}

export const useHabitSortPreferences = () => {
  const { data: user } = useCurrentUser();
  const storageKey = user?.email ? `took:${user.email}:sort` : null;
  const source = useRef(Symbol('habit-order'));

  const { value: sortPreferences, setStoredValue: setSortPreferences, isStorageReady } = useLocalStorage<SortPreferences>(storageKey, {});

  const customHabitOrder = sortPreferences.habitCustom ?? [];
  const sortValue = sortPreferences.habit ?? DEFAULT_SORT_BY_KEY.habit;
  const priorityFirst = sortValue !== 'CUSTOM' && (sortPreferences.habitPriorityFirst ?? false);

  const onToggleSort = useCallback(() => {
    setSortPreferences((previousPreferences) => {
      const currentSort = previousPreferences.habit ?? DEFAULT_SORT_BY_KEY.habit;
      const currentIndex = HABIT_SORT_OPTIONS.indexOf(currentSort);
      const nextSort = HABIT_SORT_OPTIONS[(currentIndex + 1) % HABIT_SORT_OPTIONS.length];
      return {
        ...previousPreferences,
        habit: nextSort,
        habitPriorityFirst: nextSort === 'CUSTOM' ? false : previousPreferences.habitPriorityFirst,
      };
    });
  }, [setSortPreferences]);

  const onTogglePriorityFirst = useCallback(() => {
    setSortPreferences((previousPreferences) => {
      if (previousPreferences.habit === 'CUSTOM') return previousPreferences;
      const nextPriorityFirst = !previousPreferences.habitPriorityFirst;
      return {
        ...previousPreferences,
        habit: previousPreferences.habit,
        habitPriorityFirst: nextPriorityFirst,
      };
    });
  }, [setSortPreferences]);

  useEffect(() => {
    if (!storageKey) return;

    const onOrderChanged = (event: Event) => {
      const { key, order, source: eventSource } = (event as CustomEvent<HabitOrderChangedDetail>).detail;
      if (key !== storageKey || eventSource === source.current) return;
      setSortPreferences((previousPreferences) => ({ ...previousPreferences, habitCustom: order }));
    };

    window.addEventListener(HABIT_ORDER_CHANGED_EVENT, onOrderChanged);
    return () => window.removeEventListener(HABIT_ORDER_CHANGED_EVENT, onOrderChanged);
  }, [setSortPreferences, storageKey]);

  const setCustomHabitOrder = useCallback((value: number[]) => {
    setSortPreferences((previousPreferences) => ({ ...previousPreferences, habitCustom: value }));
    if (storageKey) {
      window.dispatchEvent(new CustomEvent<HabitOrderChangedDetail>(HABIT_ORDER_CHANGED_EVENT, {
        detail: { key: storageKey, order: value, source: source.current },
      }));
    }
  }, [setSortPreferences, storageKey]);

  const setSort = useCallback((value: typeof sortValue, priority: boolean) => {
    setSortPreferences((previous) => ({ ...previous, habit: value, habitPriorityFirst: value === 'CUSTOM' ? false : priority }));
  }, [setSortPreferences]);

  return {
    setSort,
    customHabitOrder,
    setCustomHabitOrder,
    sortValue,
    priorityFirst,
    onToggleSort,
    onTogglePriorityFirst,
    isStorageReady,
  };
};

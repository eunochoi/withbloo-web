import type { HabitData } from "@/common/actions/habit/types";

export type HabitSortEntry = Pick<HabitData, 'id' | 'name' | 'priority' | 'createdAt' | 'iconKey' | 'iconColor'>;
export interface HabitManualSortItemProps {
  habit: HabitSortEntry;
}

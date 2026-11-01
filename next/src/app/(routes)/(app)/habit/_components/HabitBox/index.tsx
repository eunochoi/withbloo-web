'use client';

import { checkHabit as checkHabitAction, uncheckHabit as uncheckHabitAction } from "@/common/actions/habit";
import type { HabitPageData } from "@/common/actions/habit/types";
import { authAction } from "@/common/auth/authAction";
import { showNotice } from '@/common/components/ui/Notice/notice';
import { cn } from "@/common/utils/cn";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { memo, useRef, useState } from "react";

import HabitBoxHeader from "./HabitBoxHeader";
import HabitBoxRecentDays from "./HabitBoxRecentDays";

interface Props {
  name: string;
  id: number;
  priority: number;
  iconKey: string;
  iconColor: string;
  startedDate: string;
  recentDateStatus: boolean[];
  todayString: string;
}

const HabitBox = ({ name, id, priority, iconKey, iconColor, startedDate, recentDateStatus, todayString }: Props) => {
  const queryClient = useQueryClient();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const updatingRef = useRef(false);



  const onToggleHabit = async (checked: boolean, dateString: string) => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setUpdating(true);
    try {
      if (checked) {
        await authAction(() => checkHabitAction({ habitId: id, date: dateString }));
      }
      else {
        await authAction(() => uncheckHabitAction({ habitId: id, date: dateString }));
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['habit', 'today-stat'] }),
        queryClient.invalidateQueries({ queryKey: ['habit', 'flow'] }),
        queryClient.invalidateQueries({ queryKey: ['habit', 'date'] }),
        queryClient.invalidateQueries({ queryKey: ['habit', 'id', String(id)] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['diary-habit', 'month'] }),
        queryClient.invalidateQueries({ queryKey: ['stats', 'habit'] }),
        queryClient.invalidateQueries({ queryKey: ['stats', 'years'] }),
      ]);

      // ['habits', 'page', todayString] 모두 갱신하면 범위가 크기 때문에 setQueriesData 이용해서 해당 HabitBox 데이터만 갱신
      await queryClient.cancelQueries({ queryKey: ['habits', 'page', todayString] });
      const dateIndex = Array.from({ length: 4 }, (_, index) => format(subDays(parseISO(todayString), index), 'yyyy-MM-dd')).indexOf(dateString);
      if (dateIndex !== -1) {
        queryClient.setQueriesData<HabitPageData[]>({ queryKey: ['habits', 'page', todayString] }, (old) =>
          old?.map((habit) => {
            if (habit.id !== id) return habit;
            const updatedStatus = [...habit.recentDateStatus];
            updatedStatus[dateIndex] = checked;
            return { ...habit, recentDateStatus: updatedStatus };
          }),
        );
      }
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '습관 체크 변경 실패');
    } finally {
      updatingRef.current = false;
      setUpdating(false);
    }
  };

  const controlsDisabled = isUpdating;

  return (
    <article className={cn("gap-4 relative mx-auto flex h-full w-full min-w-0 flex-col bg-theme-surface px-2 py-5 desktop:px-4", isMenuOpen && "z-10")}>
      <HabitBoxHeader
        id={id}
        name={name}
        priority={priority}
        iconKey={iconKey}
        iconColor={iconColor}
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
      />
      <HabitBoxRecentDays
        iconColor={iconColor}
        name={name}
        startedDate={startedDate}
        recentDateStatus={recentDateStatus}
        todayString={todayString}
        controlsDisabled={controlsDisabled}
        onToggleHabit={onToggleHabit}
      />
    </article>
  );
};

export default memo(HabitBox);

'use client';

import { DragIcon } from '@/common/constants/appIcons';

import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitIcon from '@/common/components/ui/HabitIcon';
import ScrollableName from '@/common/components/ui/ScrollableName';
import { cn } from "@/common/utils/cn";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { HabitManualSortItemProps } from "./_types";

export const HabitManualSortItem = ({ habit }: HabitManualSortItemProps) => {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl flex h-16 w-full min-w-0 shrink-0 items-center gap-3 p-4 text-sm text-theme-text-primary",
        isDragging && "relative z-10 bg-theme-accent/10",
      )}
      style={style}
    >
      <HabitIcon iconKey={habit.iconKey} iconColor={habit.iconColor} className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1"><ScrollableName name={habit.name} className="font-medium" /></span>
      <span className="shrink-0"><HabitPriority priority={habit.priority} className="text-sm" /></span>
      <button
        ref={setActivatorNodeRef}
        className="flex h-12 w-12 shrink-0 touch-none items-center justify-center -m-4 p-3 text-theme-accent-deep"
        {...attributes}
        {...listeners}
        aria-label={`${habit.name} 순서 변경`}
        type="button"
      >
        <DragIcon className='text-xl' />
      </button>
    </div>
  );
};

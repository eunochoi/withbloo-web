'use client';

import { DragIcon } from '@/common/constants/appIcons';

import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import { cn } from "@/common/utils/cn";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { HabitItemProps } from "./_types";

export const HabitItem = ({ habit }: HabitItemProps) => {
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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg flex h-16 w-full min-w-0 shrink-0 items-center gap-3 px-2 py-3 text-sm text-theme-text-primary",
        isDragging && "relative z-10 bg-theme-accent/10",
      )}
      style={style}
    >
      <span className='flex w-20 shrink-0 items-center text-base text-theme-accent'>
        <HabitPriority priority={habit?.priority} />
      </span>
      <span className='min-w-0 flex-1 truncate font-medium'>{habit?.name}</span>
      <button
        ref={setActivatorNodeRef}
        className="flex h-10 w-10 shrink-0 touch-none items-center justify-center text-theme-text-tertiary"
        {...attributes}
        {...listeners}
        aria-label={`${habit.name} 순서 변경`}
        type="button"
      >
        <DragIcon className='text-base' />
      </button>
    </div>
  );
};

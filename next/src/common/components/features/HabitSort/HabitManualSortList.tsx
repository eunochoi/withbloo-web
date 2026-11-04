'use client';

import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { HabitSortEntry } from "./_types";
import { HabitManualSortItem } from "./HabitManualSortItem";

interface HabitManualSortListProps {
  tempHabits: HabitSortEntry[];
  onOrderChange: (habits: HabitSortEntry[]) => void;
  disabled?: boolean;
}

export const HabitManualSortList = ({ tempHabits, onOrderChange, disabled = false }: HabitManualSortListProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tempHabits.findIndex((item) => item.id === active.id);
    const newIndex = tempHabits.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onOrderChange(arrayMove(tempHabits, oldIndex, newIndex));
  };

  return (
    <div className="w-full min-w-0 bg-theme-bg rounded-xl" inert={disabled}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
      >
        <SortableContext items={tempHabits.map((habit) => habit.id)} strategy={verticalListSortingStrategy}>
          {tempHabits.map((tempHabit) => (
            <HabitManualSortItem key={tempHabit.id} habit={tempHabit} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

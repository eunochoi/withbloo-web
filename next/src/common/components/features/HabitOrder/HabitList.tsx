'use client';

import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Habit } from "./_types";
import { HabitItem } from "./HabitItem";

interface HabitListProps {
  tempHabits: Habit[];
  onOrderChange: (habits: Habit[]) => void;
}

export const HabitList = ({ tempHabits, onOrderChange }: HabitListProps) => {
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

  return (<div className='w-full'>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <div className="w-full">
        <SortableContext items={tempHabits.map((habit) => habit.id)} strategy={verticalListSortingStrategy}>
          {tempHabits.map((tempHabit) => (
            <HabitItem key={tempHabit.id} habit={tempHabit} />
          ))}
        </SortableContext>
      </div>

    </DndContext>
  </div>);
};

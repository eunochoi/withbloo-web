import type { HabitData } from '@/common/actions/habit';
import {
  HABIT_NAME_MAX_LENGTH,
  HABIT_NAME_MIN_LENGTH,
  HABIT_PRIORITY_MAX,
  HABIT_PRIORITY_MIN,
} from '@/common/constants/habit';
import { useQueryClient } from '@tanstack/react-query';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { useState } from 'react';

type UseHabitSubmissionParams = {
  name: string;
  priority: number;
  saveHabit: (name: string) => Promise<HabitData>;
  successMessage: string;
  failureMessage: string;
  onSuccess: () => void;
};

export const useHabitSubmission = ({
  name,
  priority,
  saveHabit,
  successMessage,
  failureMessage,
  onSuccess,
}: UseHabitSubmissionParams) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (
      trimmedName.length < HABIT_NAME_MIN_LENGTH
      || trimmedName.length > HABIT_NAME_MAX_LENGTH
    ) {
      showNotice(
        `습관 이름은 ${HABIT_NAME_MIN_LENGTH}~${HABIT_NAME_MAX_LENGTH}자로 입력해주세요.`,
      );
      return;
    }
    if (
      !Number.isInteger(priority)
      || priority < HABIT_PRIORITY_MIN
      || priority > HABIT_PRIORITY_MAX
    ) {
      showNotice('습관 우선순위가 올바르지 않습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const savedHabit = await saveHabit(trimmedName);

      queryClient.setQueryData(['habit', 'id', String(savedHabit.id)], savedHabit);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['habits'] }),
        queryClient.invalidateQueries({ queryKey: ['habit'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['diary-habit'] }),
      ]);
      onSuccess();
      setTimeout(() => showNotice(successMessage), 300);
    } catch (error) {
      console.error(failureMessage, error);
      showNotice(error instanceof Error ? error.message : failureMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};

import { HABIT_NAME_MAX_LENGTH } from '@/common/constants/habit';
import { cn } from '@/common/utils/cn';

interface HabitFormNameInputProps {
  name: string;
  setName: (value: string) => void;
}

const HabitFormNameInput = ({
  name,
  setName,
}: HabitFormNameInputProps) => {
  const isOverLimit = name.length > HABIT_NAME_MAX_LENGTH;

  return (
    <div className="flex w-full flex-col gap-3 px-2">
      <input
        name="habit-form-name"
        aria-label="습관 이름"
        aria-describedby="habit-name-count"
        aria-invalid={isOverLimit}
        className="min-h-12 w-full border-none bg-transparent text-base leading-8 text-theme-text-primary placeholder:text-theme-text-tertiary"
        maxLength={HABIT_NAME_MAX_LENGTH}
        onChange={(event) => setName(event.currentTarget.value)}
        placeholder="매일 물 마시기"
        value={name}
      />
      <div id="habit-name-count" className={cn('flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs tabular-nums', isOverLimit ? 'text-theme-danger' : 'text-theme-text-tertiary')}>
        {isOverLimit && <span role="alert">저장하려면 {name.length - HABIT_NAME_MAX_LENGTH}자를 줄여주세요.</span>}
        <span>{name.length} / {HABIT_NAME_MAX_LENGTH}</span>
      </div>
    </div>
  );
};

export default HabitFormNameInput;

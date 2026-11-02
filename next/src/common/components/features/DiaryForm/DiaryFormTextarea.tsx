import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { cn } from '@/common/utils/cn';

interface DiaryFormTextareaProps {
  text: string;
  setText: (v: string) => void;
  onFocusChange: (focused: boolean) => void;
}

const DiaryFormTextarea = ({ text, setText, onFocusChange }: DiaryFormTextareaProps) => {
  const isOverLimit = text.length > DIARY_TEXT_MAX_LENGTH;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3 p-2">
      <textarea
        name="diary-form-text"
        aria-label="일기 내용"
        aria-describedby="diary-text-count"
        aria-invalid={isOverLimit}
        className="min-h-[170px] w-full flex-1 resize-none border-none bg-transparent text-base leading-8 text-theme-text-primary placeholder:text-theme-text-tertiary"
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        onChange={(event) => setText(event.target.value)}
        value={text}
        maxLength={DIARY_TEXT_MAX_LENGTH}
        placeholder="기억하고 싶은 순간을 남겨보세요."
      />
      <div id="diary-text-count" className={cn('flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs tabular-nums', isOverLimit ? 'text-theme-danger' : 'text-theme-text-tertiary')}>
        {isOverLimit && <span role="alert">저장하려면 {text.length - DIARY_TEXT_MAX_LENGTH}자를 줄여주세요.</span>}
        <span>{text.length} / {DIARY_TEXT_MAX_LENGTH}</span>
      </div>
    </div>
  );
};

export default DiaryFormTextarea;

import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { useIsPresent } from 'framer-motion';
import { useState } from 'react';

const categories = [
  {
    label: '긍정',
    summary: '마음이 밝거나 편안했던 순간',
    emotions: [0, 1, 2, 3],
  },
  {
    label: '중립',
    summary: '담담함부터 피로, 미묘하게 섞인 마음까지',
    emotions: [4, 9, 10, 11],
  },
  {
    label: '부정',
    summary: '마음이 무겁거나 복잡했던 순간',
    emotions: [5, 6, 7, 8],
  },
];
const descriptions = [
  '마음이 포근하고 만족스러워요',
  '즐겁고 신나는 마음이 들어요',
  '누군가나 무언가가 소중하게 느껴져요',
  '마음이 차분하고 편안해요',
  '예상하지 못한 일에 놀랐어요',
  '걱정이 들고 마음이 조마조마해요',
  '마음이 가라앉고 울적해요',
  '짜증이 나거나 화가 올라와요',
  '마음이 복잡하고 정리가 어려워요',
  '특별한 감정 없이 담담한 상태',
  '에너지가 부족하고 지친 상태',
  '좋고 나쁜 감정이 뒤섞여 미묘한 상태',
];

interface DiaryFormEmotionPickerProps {
  emotion: number;
  onClose: () => void;
  onConfirm: (emotion: number) => void;
}

const DiaryFormEmotionPicker = ({
  emotion,
  onClose,
  onConfirm,
}: DiaryFormEmotionPickerProps) => {
  const [draftEmotion, setDraftEmotion] = useState(emotion);
  const [categoryIndex, setCategoryIndex] = useState(() =>
    Math.max(
      0,
      categories.findIndex((category) => category.emotions.includes(emotion)),
    ),
  );
  const isPresent = useIsPresent();
  const category = categories[categoryIndex];

  return (
    <PickerDialog labelledBy="diary-emotion-picker-title" onClose={onClose}>
      <fieldset
        disabled={!isPresent}
        className="m-0 flex w-full min-w-0 flex-col gap-4 border-0 pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <div className="relative flex min-h-11 items-center justify-center">
          <h2
            id="diary-emotion-picker-title"
            className="text-center text-lg font-semibold text-theme-text-primary"
          >
            오늘의 감정을 골라주세요
          </h2>
        <button
          type="button"
          disabled={!EMOTIONS.some((item) => item.id === draftEmotion)}
          onClick={() => onConfirm(draftEmotion)}
          className="absolute right-0 min-h-11 px-2 text-lg font-normal text-theme-accent disabled:opacity-40"
        >
          완료
        </button>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="감정 분류"
        >
          {categories.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={categoryIndex === index}
              onClick={() => setCategoryIndex(index)}
              className={`min-h-12 rounded-full border px-4 py-2 text-sm ${categoryIndex === index ? 'border-theme-accent bg-theme-accent/10 font-semibold text-theme-accent' : 'border-theme-border text-theme-text-secondary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-theme-accent/20 bg-theme-accent-light/60 p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-theme-surface">
            <EmotionImage
              emotion={EMOTIONS[category.emotions[0]]}
              alt=""
              width={44}
              height={44}
            />
          </span>
          <span className="flex min-w-0 flex-col gap-1.5">
            <strong className="text-base text-theme-accent-deep">
              {category.label}
            </strong>
            <span className="text-sm leading-5 text-theme-text-secondary">
              {category.summary}
            </span>
          </span>
        </div>
        <div
          className="grid auto-rows-fr grid-cols-2 gap-3"
          role="group"
          aria-label="감정 선택"
        >
          {category.emotions.map((id) => {
            const item = EMOTIONS[id];
            const selected = draftEmotion === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setDraftEmotion(id)}
                className={`flex min-w-0 flex-col items-center gap-2 rounded-2xl border px-4 py-6 ${selected ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent'}`}
              >
                <EmotionImage
                  emotion={item}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <strong
                  className={`text-base ${selected ? 'text-theme-accent' : 'text-theme-text-primary'}`}
                >
                  {item.nameKr}
                </strong>
                <span className="text-center text-sm leading-5 text-theme-text-secondary">
                  {descriptions[id]}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </PickerDialog>
  );
};

export default DiaryFormEmotionPicker;

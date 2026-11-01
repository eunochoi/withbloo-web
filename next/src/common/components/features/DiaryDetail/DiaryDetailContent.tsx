
import ScrollableName from '@/common/components/ui/ScrollableName';
import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from "@/common/constants/emotions";
import type { DiaryData } from "@/common/types/diary";
import HabitIcon from '@/common/components/ui/HabitIcon';

interface DiaryDetailContentProps {
  diaryData: DiaryData;
}

export const DiaryDetailContent = ({ diaryData }: DiaryDetailContentProps) => {
  const emotion = EMOTIONS[diaryData.emotion] ?? EMOTIONS[9];

  return (
    <article className="flex min-w-0 flex-col gap-6 landscape-short:gap-4" aria-label="일기">
      <div className="flex items-center gap-5">
        <EmotionImage
          className="h-14 w-14 shrink-0 object-contain landscape-short:h-14 landscape-short:w-14"
          emotion={emotion}
          alt=""
          width={56}
          height={56}
        />
        <div className="">
          <p className="text-sm font-bold text-theme-accent">오늘의 감정</p>
          <h2 className="mt-1 text-xl font-medium text-theme-text-primary landscape-short:text-xl">
            {emotion.nameKr}
          </h2>
        </div>
      </div>
      {diaryData.Habits.length > 0 && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-2" aria-label="습관">
          {diaryData.Habits.map((habit) => (
            <span
              key={habit.id}
              className="inline-flex max-w-full items-center gap-1 text-left text-sm text-theme-text-secondary"
            >
              <HabitIcon iconKey={habit.iconKey} iconColor={habit.iconColor} className="shrink-0 text-base" />
              <ScrollableName name={habit.name} />
            </span>
          ))}
        </div>
      )}
      <div className="whitespace-pre-wrap px-1 py-2 break-words text-base leading-8 text-theme-text-primary">
        {diaryData.text}
      </div>
    </article>
  );
};

'use client';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { DIARY_TEXT_PREVIEW_LINE_COUNT } from '@/common/constants/diary';
import type { DiaryData } from '@/common/types/diary';
import { useRouter } from 'next/navigation';
import HabitIcon from '@/common/components/ui/HabitIcon';
import DiaryCardHeader from './DiaryCardHeader';
import FeedCardPhotos from '../FeedCardPhotos';

interface Props {
  diaryData: DiaryData;
  priorityImage?: boolean;
}

const DiaryCard = ({ diaryData, priorityImage = false }: Props) => {
  const router = useRouter();
  const { Images: images } = diaryData;
  const href = `/diary/${diaryData.id}`;

  const navigateToZoom = () => {
    router.push(href, { scroll: false });
  };
  const handleHabitClick = (habitId: number) => {
    router.push(`/habit/${habitId}`, { scroll: false });
  };

  return (
    <article className="box-border flex w-full shrink-0 flex-col gap-4 py-6 first:pt-0">
      <DiaryCardHeader diaryData={diaryData} />
      <div className='flex flex-col w-full h-auto p-2 gap-3'>
        <div className="flex flex-col gap-3">
          <FeedCardPhotos images={images} href={href} label={`${diaryData.date} 일기`} priority={priorityImage} />
          <button
            type="button"
            onClick={navigateToZoom}
            aria-label={`${diaryData.date} 일기 자세히 보기`}
            className="min-w-0 w-full text-left"
          >
            <span
              className="overflow-hidden text-base leading-7 text-theme-text-secondary whitespace-pre-wrap break-words [display:-webkit-box] [-webkit-box-orient:vertical]"
              style={{ WebkitLineClamp: DIARY_TEXT_PREVIEW_LINE_COUNT }}
            >
              {diaryData.text}
            </span>
          </button>
        </div>
        {diaryData.Habits.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2" aria-label="습관">
            {diaryData.Habits.map((habit) => (
              <button
                type="button"
                key={habit.id}
                onClick={() => handleHabitClick(habit.id)}
                className="inline-flex max-w-full items-center gap-1 text-left text-sm text-theme-text-secondary"
              >
                <HabitIcon iconKey={habit.iconKey} iconColor={habit.iconColor} className="shrink-0 text-base" />
                <ScrollableName name={habit.name} />
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default DiaryCard;

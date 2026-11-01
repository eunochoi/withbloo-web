import { ChevronRightIcon, MoreIcon } from '@/common/constants/appIcons';
import Carousel from '@/common/components/ui/Carousel';
import DiaryMenus from '@/common/components/ui/Diary/DiaryMenus';
import { DIARY_TEXT_PREVIEW_LINE_COUNT } from '@/common/constants/diary';
import type { DiaryData } from '@/common/types/diary';
import { cn } from '@/common/utils/cn';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import DayInfoSectionHeader from '../DayInfoSectionHeader';
import DayInfoDiaryEmptyState from './DayInfoDiaryEmptyState';

interface Props {
  diaryData?: DiaryData | null;
  isFuture: boolean;
  onAddDiary: () => void;
  onOpenDiary: () => void;
}

const DayInfoDiarySection = ({ diaryData, isFuture, onAddDiary, onOpenDiary }: Props) => {
  const hasDiary = !!diaryData;
  const images = diaryData?.Images ?? [];
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [diaryData]);

  return (
    <div className="relative min-w-0 p-1">
      <DayInfoSectionHeader title="감정 일기">
        {hasDiary && (
          <button
            className="-mr-2 flex cursor-pointer items-center gap-2 text-xl text-theme-text-tertiary"
            onClick={() => setMenuOpen((prev) => !prev)}
            type="button"
            aria-label="일기 메뉴"
            aria-expanded={isMenuOpen}
          >
            <MoreIcon />
          </button>
        )}
      </DayInfoSectionHeader>
      {hasDiary && (
        <DiaryMenus
          showDetail
          isMenuOpen={isMenuOpen}
          setMenuOpen={setMenuOpen}
          diaryData={diaryData}
        />
      )}
      <div className="flex w-full py-3 px-2">
        {hasDiary ? (
          <div className="flex w-full items-stretch gap-3"
            onClick={onOpenDiary}
          >
            {images.length > 0 && (
              <Carousel
                containerClassName="w-2/5 shrink-0"
                className="aspect-square"
                showImageBorder
              >
                {images.map((image, index) => (
                  <Image
                    className="h-full w-full object-cover"
                    key={image.id}
                    src={image.src}
                    width={600}
                    height={600}
                    sizes="(min-width: 1024px) 140px, (min-width: 480px) min(200px, calc(40vw - 35px)), calc(36vw - 6px)"
                    alt={`일기 이미지 ${index + 1}`}
                  />
                ))}
              </Carousel>
            )}
            <div
              className={cn(
                'flex min-w-0 flex-1 flex-col gap-4',
                images.length > 0 && 'justify-evenly',
              )}
            >
              <p
                className="overflow-hidden whitespace-pre-wrap break-words text-base leading-relaxed text-theme-text-secondary [display:-webkit-box] [-webkit-box-orient:vertical]"
                style={{ WebkitLineClamp: DIARY_TEXT_PREVIEW_LINE_COUNT }}
              >
                {diaryData.text}
              </p>
              <button className="flex items-center self-end text-xs text-theme-accent desktop:text-sm" type="button">
                일기 전체 보기 <ChevronRightIcon className="text-lg" />
              </button>
            </div>
          </div>
        ) : (
          <DayInfoDiaryEmptyState isFuture={isFuture} onAddDiary={onAddDiary} />
        )}
      </div>
    </div>
  );
};

export default DayInfoDiarySection;

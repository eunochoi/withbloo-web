import { MoreIcon } from '@/common/constants/appIcons';
import DiaryMenus from '@/common/components/ui/Diary/DiaryMenus';
import EmotionImage from '@/common/components/ui/EmotionImage';
import ScrollableName from '@/common/components/ui/ScrollableName';
import { EMOTIONS } from '@/common/constants/emotions';
import type { DiaryData } from '@/common/types/diary';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';


interface Props {
  diaryData: DiaryData;
}

const DiaryCardHeader = ({ diaryData }: Props) => {
  const dateForDisplay = parseLocalDate(diaryData.date);
  const formattedDate = format(dateForDisplay, 'yy년 M월 d일', { locale: ko });
  const week = format(dateForDisplay, 'EEEE', { locale: ko });
  const emotion = EMOTIONS[diaryData.emotion];

  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [diaryData]);

  return (
    <div className="relative flex min-w-0 w-full items-center gap-3">
      <Link
        href={`/diary/${diaryData.id}`}
        scroll={false}
        aria-label={`${diaryData.date} 일기 자세히 보기`}
        className="flex min-w-0 shrink items-center gap-3 text-left"
      >
        {emotion && (
          <EmotionImage emotion={emotion} alt="" className="h-12 w-12 shrink-0 object-contain" />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-baseline gap-1 text-base font-semibold text-theme-text-primary">
            <span className="shrink-0 whitespace-nowrap">{emotion ? '일기 ·' : '일기'}</span>
            {emotion && <ScrollableName name={emotion.nameKr} />}
          </span>
          <time dateTime={diaryData.date} className="flex flex-wrap gap-x-2 text-sm text-theme-text-tertiary">
            <span className="whitespace-nowrap">{formattedDate}</span>
            <span>{week}</span>
          </time>
        </div>
      </Link>
      <button
        className="-mr-5 ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-theme-text-tertiary"
        aria-label="일기 메뉴"
        aria-expanded={isMenuOpen}
        onClick={handleToggleMenu}
        type="button"
      >
        <MoreIcon />
      </button>
      <DiaryMenus
          showDetail
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        diaryData={diaryData}
      />
    </div>
  );
};

export default DiaryCardHeader;

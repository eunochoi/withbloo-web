import type { Emotion } from '@/common/constants/emotions';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  date: string;
  emotion?: Emotion;
}

const DayInfoHeader = ({ date, emotion }: Props) => {
  const formattedDate = format(parseLocalDate(date), 'M월 d일 EEEE', { locale: ko });

  return (
    <header className="py-2 flex items-stretch">
      <h2 className="text-xl font-semibold text-theme-text-primary">{formattedDate}</h2>
    </header>
  );
};

export default DayInfoHeader;

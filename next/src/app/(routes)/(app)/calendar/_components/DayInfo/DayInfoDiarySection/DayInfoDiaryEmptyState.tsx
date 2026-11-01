import { AddIcon } from '@/common/constants/appIcons';


interface Props {
  isFuture: boolean;
  onAddDiary: () => void;
}

const DayInfoDiaryEmptyState = ({ isFuture, onAddDiary }: Props) => (
  <div className="flex w-full flex-col items-center px-2 py-4 text-center">
    {isFuture ? (
      <p className="text-sm leading-relaxed text-theme-text-tertiary desktop:text-sm">
        아직 기록할 수 없는 날짜예요.<br />오늘이 되면 일기를 작성할 수 있어요.
      </p>
    ) : (
      <>
        <p className="mt-1 text-sm text-theme-text-tertiary desktop:text-sm">아직 작성한 일기가 없어요.</p>
        <p className="mt-1 text-sm text-theme-text-tertiary desktop:text-sm">하루의 이야기를 가볍게 남겨보세요.</p>
        <button className="mt-6 flex min-h-9 items-center gap-1.5 rounded-full bg-theme-accent px-4 text-xs text-theme-text-on-accent desktop:text-sm" onClick={onAddDiary} type="button">
          <AddIcon className="text-lg" /> 일기 쓰기
        </button>
      </>
    )}
  </div>
);

export default DayInfoDiaryEmptyState;

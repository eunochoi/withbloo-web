'use client';
import { useQuery } from '@tanstack/react-query';
import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { soberQueries } from '@/common/queries/soberQueries';
import HabitIcon from '@/common/components/ui/HabitIcon';
import { SoberIcon } from '@/common/components/features/Sober/SoberIcon';
import { DateSelectionCalendar } from '@/common/components/ui/DateSelectionCalendar';
import { DateSelectionForm } from '@/common/components/ui/DateSelectionForm';


import type { RecordScope } from '@/common/actions/records';
import { BottomSheet, type BottomSheetHandle } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { BottomSheetPicker } from '@/common/components/ui/BottomSheet/BottomSheetPicker';
import { BottomSheetPickerHeader } from '@/common/components/ui/BottomSheet/BottomSheetPickerHeader';
import { BottomSheetSubmitButton } from '@/common/components/ui/BottomSheet/BottomSheetSubmitButton';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import ImageAttachments from '@/common/components/ui/ImageAttachments';
import { ImageAttachmentsHeader } from '@/common/components/ui/ImageAttachments/ImageAttachmentsHeader';
import type { ImageAttachmentDraft } from '@/common/components/ui/ImageAttachments/types';
import { useImageAttachments } from '@/common/components/ui/ImageAttachments/useImageAttachments';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { format } from 'date-fns';
import { useRef, useState, type Ref } from 'react';

export default function ActivityRecordForm({
  initialStartedAt,
  scope,
  parentId,
  name,
  editing,
  initialValue,
  initialMemo,
  saving,
  onClose,
  onSave,
  recordType = 'RESTART',
  errorMessage,
  initialImages = [],
  sheetRef,
}: {
  initialStartedAt: Date | string;
  scope: RecordScope;
  parentId: number;
  name: string;
  recordType?: 'MEMO' | 'RESTART';
  errorMessage?: string;
  editing: boolean;
  initialValue: string;
  initialMemo: string;
  saving: boolean;
  onClose: () => void;
  onSave: (value: string, memo: string, images: ImageAttachmentDraft[], type: 'MEMO' | 'RESTART') => Promise<void>;
  initialImages?: ImageAttachmentDraft[];
  sheetRef?: Ref<BottomSheetHandle>;
}) {
  const [isRestart, setIsRestart] = useState(recordType === 'RESTART');
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerOriginal = useRef({ date: '', hour: '', minute: '' });
  const [date, setDate] = useState(initialValue.slice(0, 10));
  const [hour, setHour] = useState(initialValue.slice(11, 13));
  const [minute, setMinute] = useState(initialValue.slice(14, 16));
  const [memo, setMemo] = useState(initialMemo);
  const [diaryImages, setDiaryImages] = useState<ImageAttachmentDraft[]>(initialImages);
  const imageHandlers = useImageAttachments({ images: diaryImages, setImages: setDiaryImages });
  const [error, setError] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(date, {
    minDate: format(new Date(initialStartedAt), 'yyyy-MM-dd'),
    maxDate: today,
  });
  const habit = useQuery({ ...habitQueries.byId(String(parentId), authAction), enabled: pickerOpen && scope === 'habit' });
  const habitMonth = useQuery({ ...habitQueries.month(String(parentId), calendar.visibleMonth, authAction), enabled: pickerOpen && scope === 'habit' });
  const soberList = useQuery({ ...soberQueries.list(authAction), enabled: pickerOpen && scope === 'sober' });
  const sober = soberList.data?.find((item) => item.id === parentId);

  const openPicker = () => {
    pickerOriginal.current = { date, hour, minute };
    calendar.showDate(date);
    setError('');
    setPickerOpen(true);
  };
  const closePicker = () => {
    setDate(pickerOriginal.current.date);
    setHour(pickerOriginal.current.hour);
    setMinute(pickerOriginal.current.minute);
    setError('');
    setPickerOpen(false);
  };
  const validateTime = () => {
    const local = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const time = new Date(local).getTime();
    if (
      !/^\d{1,2}$/.test(hour) ||
      !/^\d{1,2}$/.test(minute) ||
      Number(hour) > 23 ||
      Number(minute) > 59 ||
      !Number.isFinite(time) ||
      format(new Date(time), "yyyy-MM-dd'T'HH:mm") !== local ||
      time > Date.now()
    ) {
      setError('현재 또는 과거 날짜와 시간을 선택해주세요.');
      return false;
    }
    const startedAt = new Date(initialStartedAt).getTime();
    const sameStartMinute = Math.floor(time / 60000) === Math.floor(startedAt / 60000);
    if (time < startedAt && !sameStartMinute) {
      setError('시작 시각 이후에 기록해주세요.');
      return false;
    }
    setError('');
    return true;
  };
  const save = async () => {
    if (!validateTime()) return;
    const local = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const time = new Date(local).getTime();
    const startedAt = new Date(initialStartedAt).getTime();
    if (!isRestart && !memo.trim()) { setError('내용을 입력해주세요.'); return; }
    setError('');
    await onSave(time < startedAt ? new Date(startedAt).toISOString() : local, memo, diaryImages, isRestart ? 'RESTART' : 'MEMO');
  };
  const title = editing ? '기록 수정' : '기록 추가';
  return (
    <BottomSheet ref={sheetRef} ariaLabel={title} dismissible={!saving} preserveHandle onClose={onClose}>
      <BottomSheetTitle title={title} headerButton={<BottomSheetSubmitButton
        type="button"
        disabled={saving}
        aria-busy={saving}
        onClick={() => void save()}
      >
        {saving ? '저장 중' : '저장'}
      </BottomSheetSubmitButton>}
      />
      <BottomSheetBody showScrollFade>
        <fieldset
          disabled={saving}
          className="m-0 flex min-w-0 flex-col gap-5 border-0 pb-6"
        >
          {scope === 'sober' && (
            <label className="flex min-h-12 items-center justify-between gap-3 text-lg font-semibold">
              <span>다시 시작하기</span>
              <input type="checkbox" role="switch" checked={isRestart} onChange={(event) => { setIsRestart(event.target.checked); setError(''); }} className="peer sr-only" />
              <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5" />
            </label>
          )}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">기록 일시</h2>
            <button type="button" onClick={openPicker} className="px-1 text-left text-base text-theme-text-secondary">
              {format(new Date(`${date}T00:00:00`), 'yyyy년 M월 d일')} · {hour.padStart(2, '0')}:{minute.padStart(2, '0')}
            </button>
          </section>
          <label className="flex flex-col gap-3 text-base">
            <span className="text-lg font-semibold">내용 {isRestart && <span className="text-base font-normal text-theme-text-tertiary">(선택)</span>}</span>
            <textarea
              aria-label="내용"
              value={memo}
              maxLength={500}
              onChange={(event) => {
                setMemo(event.target.value);
                setError('');
              }}
              placeholder={`'${name}' 항목과 관련된 내용을 입력하세요.`}
              className="mx-1 h-[200px] resize-none bg-transparent p-0 text-base leading-6 text-theme-text-primary placeholder:text-theme-text-secondary"
            />
            <span className="px-1 text-right text-xs text-theme-text-tertiary">
              {memo.length} / 500
            </span>
          </label>
          <section className="flex flex-col gap-3" aria-label="첨부 사진">
            <ImageAttachmentsHeader title="사진" count={diaryImages.length} />
            <p className="px-1 text-base text-theme-text-secondary">이 기록과 함께 남기고 싶은 사진을 추가해보세요.</p>
            <ImageAttachments images={diaryImages} {...imageHandlers} isLoading={saving} onReorder={(from, to) => setDiaryImages((current) => { const next = [...current]; const [image] = next.splice(from, 1); next.splice(to, 0, image); return next; })} />
          </section>
          {scope === 'sober' && <InfoNotice>다시 시작하기 스위치를 변경하면 일반 기록으로 저장돼요.</InfoNotice>}
          {(error || errorMessage) && (
            <p role="alert" className="text-sm text-theme-danger">
              {error || errorMessage}
            </p>
          )}
        </fieldset>
      </BottomSheetBody>
      {pickerOpen && (
        <BottomSheetPicker labelledBy="record-date-title" onClose={closePicker} header={
          <BottomSheetPickerHeader>
            <BottomSheetHeading id="record-date-title">시간 선택</BottomSheetHeading>
            <button type="button" onClick={() => { if (validateTime()) setPickerOpen(false); }} className="absolute right-0 min-h-11 text-lg text-theme-accent">완료</button>
          </BottomSheetPickerHeader>
        }>
          <div className="flex flex-col gap-6 pb-6">
            <DateSelectionForm date={date} hour={hour} minute={minute} onTimeChange={(value) => { setHour(value.hour); setMinute(value.minute); setError(''); }}>
            <DateSelectionCalendar calendar={calendar} selected={date} today={today} onSelect={(date) => { setDate(date); setError(''); }} marker={(date, selected) => habitMonth.data?.daysByDate[date] && habit.data ? { icon: <HabitIcon iconKey={habit.data.iconKey} iconColor={habit.data.iconColor} colorOverride={selected ? 'rgb(var(--theme-text-on-accent))' : undefined} className="h-6 w-6" />, label: '완료 기록 있음' } : sober?.restarts.some((item) => format(new Date(item.restartedAt), 'yyyy-MM-dd') === date) ? { icon: <SoberIcon name={sober.iconKey} color={sober.iconColor} colorOverride={selected ? 'rgb(var(--theme-text-on-accent))' : undefined} className="h-6 w-6" />, label: '다시 시작 기록 있음' } : undefined} />
            </DateSelectionForm>
            {error && <p role="alert" className="text-sm text-theme-danger">{error}</p>}
          </div>
        </BottomSheetPicker>
      )}
    </BottomSheet>
  );
}

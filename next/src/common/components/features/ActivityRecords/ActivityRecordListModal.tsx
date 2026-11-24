'use client';
import { ContentTopButton, ContentTopButtons } from '@/common/components/ui/ContentTopButton';


import {
  getActivityDay,
  getActivityRecords,
  type ActivityRecord,
  type RecordCursor,
  type RecordScope,
} from '@/common/actions/records';
import { authAction } from '@/common/auth/authAction';
import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import SortPicker from '@/common/components/ui/SortPicker';
import { AddIcon, MoreIcon, SortIcon } from '@/common/constants/appIcons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { PiClockCounterClockwise } from 'react-icons/pi';
import { DiaryDetailGallery } from '../DiaryDetail/DiaryDetailGallery';
import ActivityRecordActions from './ActivityRecordActions';

export default function ActivityRecordListModal({
  scope,
  parentId,
  name,
  day,
  onOpenForm,
  onClose,
  achievements = [],
}: {
  scope: RecordScope;
  parentId: number;
  name: string;
  day: string | null;
  onOpenForm: (record: Partial<ActivityRecord>, day: string | null) => void;
  achievements?: Array<{ achievedAt: string | number; days: number }>;
  onClose: () => void;
}) {
  const [sort, setSort] = useState<'ASC' | 'DESC'>('DESC');
  const [sorting, setSorting] = useState(false);
  const [menu, setMenu] = useState<ActivityRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const start = day ? new Date(`${day}T00:00:00`) : new Date();
  const list = useInfiniteQuery({
    queryKey: [scope, 'activity-records', parentId, sort],
    enabled: !day,
    initialPageParam: null as RecordCursor | null,
    queryFn: ({ pageParam }) =>
      authAction(() => getActivityRecords(scope, parentId, sort, pageParam)),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const daily = useQuery({
    queryKey: [scope, 'activity-day', parentId, day],
    enabled: !!day,
    queryFn: () =>
      authAction(() =>
        getActivityDay(scope, parentId, start.toISOString(), addDays(start, 1).toISOString()),
      ),
  });
  const records = day ? (daily.data ?? []) : (list.data?.pages.flatMap((page) => page.items) ?? []);
  const query = day ? daily : list;
  const add = () => onOpenForm({ type: scope === 'sober' ? 'RESTART' : 'MEMO' }, day);
  return (
    <>
      <BottomSheet ariaLabel={`${name} 기록`} onClose={onClose} dismissible={!busy}>
        <BottomSheetTitle
          title={day ? format(start, 'yyyy년 M월 d일') : `${name} 기록`}
          scrollableTitle
        />
        <BottomSheetBody showScrollFade>
          <div className="flex flex-col gap-3 pb-7">
            {day ? (
              <ContentTopButtons><ContentTopButton
                type="button"
                onClick={add}

              >
                <AddIcon />
                기록 추가
              </ContentTopButton></ContentTopButtons>
            ) : (
              <ContentTopButtons>
                {records.length > 0 && <ContentTopButton onClick={() => setSorting(true)}>
                  <SortIcon />
                  {sort === 'DESC' ? '최신순' : '과거순'}
                </ContentTopButton>}
                <ContentTopButton onClick={() => onOpenForm({ type: 'MEMO' }, null)} disabled={busy}>
                  <AddIcon />
                  기록 추가
                </ContentTopButton>
              </ContentTopButtons>
            )}
            {day &&
              achievements
                .filter((item) => format(new Date(item.achievedAt), 'yyyy-MM-dd') === day)
                .map((item) => (
                  <div
                    key={`${item.days}:${item.achievedAt}`}
                    className="rounded-2xl border border-theme-border/50 p-4"
                  >
                    <p className="font-semibold">{item.days}일 달성!</p>
                    <p className="text-sm text-theme-text-secondary">
                      {format(new Date(item.achievedAt), 'HH:mm')}
                    </p>
                  </div>
                ))}
            {query.isPending ? (
              <p role="status" className="py-16 text-center">
                기록 불러오는 중
              </p>
            ) : query.isError && !query.data ? (
              <button onClick={() => void query.refetch()} className="min-h-12">
                기록을 불러오지 못했어요. 다시 시도
              </button>
            ) : !records.length ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-4 pt-8 text-center">
                <PiClockCounterClockwise aria-hidden="true" className="h-10 w-10 text-theme-text-secondary" />
                <p className="text-lg font-semibold">아직 남긴 기록이 없어요.</p>
                <p className="text-base leading-relaxed text-theme-text-secondary">기록을 추가하면 이곳에서 모아볼 수 있어요.</p>
              </div>
            ) : (
              records.map((record, index) => (
                <div key={record.id} className="space-y-3">
                  {!day &&
                    (index === 0 ||
                      format(new Date(records[index - 1].recordedAt), 'yyyy-MM-dd') !==
                      format(new Date(record.recordedAt), 'yyyy-MM-dd')) && (
                      <h3 className={`font-semibold ${index ? 'pt-6' : ''}`}>
                        {format(new Date(record.recordedAt), 'yyyy년 M월 d일')}
                      </h3>
                    )}
                  <div className="space-y-2 rounded-2xl border border-theme-border/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {format(new Date(record.recordedAt), 'HH:mm')}
                        {' · '}{scope === 'sober' && record.type === 'RESTART' ? '다시 시작 기록' : '기록'}
                      </span>
                      <button
                        type="button"
                        aria-label="기록 수정·삭제 메뉴"
                        onClick={() => setMenu(record)}
                        className="-mr-5 flex h-11 w-11 items-center justify-center text-xl text-theme-text-secondary"
                      >
                        <MoreIcon />
                      </button>
                    </div>
                    {!!record.images.length && <DiaryDetailGallery images={record.images} cardAspect />}
                    {record.memo && <p className="whitespace-pre-wrap text-sm tracking-tighter text-theme-text-secondary">{record.memo}</p>}
                  </div>
                </div>
              ))
            )}
            {!day && list.hasNextPage && (
              <button
                type="button"
                disabled={list.isFetching}
                onClick={() => void list.fetchNextPage()}
                className="min-h-11 text-theme-accent"
              >
                {list.isFetching ? '불러오는 중' : '더 보기'}
              </button>
            )}
            {query.isError && query.data && (
              <button
                onClick={() =>
                  day
                    ? void daily.refetch()
                    : list.isFetchNextPageError
                      ? void list.fetchNextPage()
                      : void list.refetch()
                }
                className="min-h-11 text-theme-danger"
              >
                기록을 불러오지 못했어요. 다시 시도
              </button>
            )}
          </div>
        </BottomSheetBody>
      </BottomSheet>
      {menu && (
        <ActivityRecordActions
          scope={scope}
          parentId={parentId}
          record={menu}
          onEdit={() => {
            onOpenForm(menu, day);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
          onBusyChange={setBusy}
        />
      )}
      {sorting && (
        <SortPicker
          title="기록 정렬"
          sortLabel="기록 일시 정렬"
          value={sort}
          options={[
            { value: 'DESC', label: '최신순' },
            { value: 'ASC', label: '과거순' },
          ]}
          onClose={() => setSorting(false)}
          onApply={(value) => {
            setSort(value);
            setSorting(false);
          }}
        />
      )}
    </>
  );
}

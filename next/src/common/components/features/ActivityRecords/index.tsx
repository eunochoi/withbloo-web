'use client';
import { ContentTopButton, ContentTopButtons } from '@/common/components/ui/ContentTopButton';


import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { authAction } from '@/common/auth/authAction';
import {
  getActivityRecords,
  getActivityDay,
  saveActivityRecord,
  deleteActivityRecord,
  type ActivityRecord,
  type RecordCursor,
  type RecordScope,
} from '@/common/actions/records';
import { BottomSheet, type BottomSheetHandle } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetPicker } from '@/common/components/ui/BottomSheet/BottomSheetPicker';
import { AddIcon, MoreIcon, SortIcon } from '@/common/constants/appIcons';
import { PiClockCounterClockwise } from 'react-icons/pi';
import SortPicker from '@/common/components/ui/SortPicker';
import ActivityRecordForm from './ActivityRecordForm';
import { uploadImagesAndCollectIds } from '@/common/components/ui/ImageAttachments/uploadImagesAndCollectIds';
import { DiaryDetailGallery } from '../DiaryDetail/DiaryDetailGallery';

export type RecordView =
  { mode: 'list' } | { mode: 'day'; date: string } | { mode: 'new'; type: 'MEMO' | 'RESTART' };
export default function ActivityRecords({
  scope,
  parentId,
  name,
  initialStartedAt,
  view,
  onClose,
  achievements = [],
}: {
  scope: RecordScope;
  parentId: number;
  name: string;
  initialStartedAt: Date | string;
  view: RecordView;
  achievements?: Array<{ achievedAt: string | number; days: number }>;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const formSheetRef = useRef<BottomSheetHandle>(null);
  const [sort, setSort] = useState<'ASC' | 'DESC'>('DESC');
  const [sorting, setSorting] = useState(false);
  const [editing, setEditing] = useState<Partial<ActivityRecord> | null>(
    view.mode === 'new' ? { type: view.type } : null,
  );
  const [menu, setMenu] = useState<ActivityRecord | null>(null);
  const [deleting, setDeleting] = useState<ActivityRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const day = view.mode === 'day' ? view.date : null;
  const start = day ? new Date(`${day}T00:00:00`) : new Date();
  const list = useInfiniteQuery({
    queryKey: [scope, 'activity-records', parentId, sort],
    enabled: view.mode === 'list',
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
  const run = async (action: () => Promise<unknown>, done: () => void) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      await client.invalidateQueries({ queryKey: [scope] });
      done();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '저장하지 못했어요.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const add = () => setEditing({ type: scope === 'sober' ? 'RESTART' : 'MEMO' });
  if (editing) {
    const now = new Date();
    let initial = editing.recordedAt
      ? new Date(editing.recordedAt)
      : day
        ? new Date(`${day}T${format(now, 'HH:mm')}`)
        : now;
    if (!editing.recordedAt && +initial < +new Date(initialStartedAt))
      initial = new Date(initialStartedAt);
    return (
      <>
        <ActivityRecordForm
          sheetRef={formSheetRef}
          key={`${editing.id ?? 'new'}:${editing.type}`}
          initialStartedAt={initialStartedAt}
          scope={scope}
          parentId={parentId}
          recordType={editing.type ?? 'MEMO'}
          errorMessage={error}
          editing={!!editing.id}
          initialValue={format(initial, "yyyy-MM-dd'T'HH:mm")}
          initialMemo={editing.memo ?? ''}
          initialImages={editing.images ?? []}
          saving={busy}
          onClose={() => (view.mode === 'new' ? onClose() : setEditing(null))}
          onSave={(value, memo, images, type) =>
            run(
              async () => {
                const { imageContentIds } = await uploadImagesAndCollectIds(images);
                return authAction(() =>
                  saveActivityRecord(scope, parentId, {
                    id: editing.id,
                    type,
                    recordedAt: new Date(value).toISOString(),
                    memo,
                    imageContentIds,
                  }),
                );
              },
              () => formSheetRef.current?.close(),
            )
          }
        />
      </>
    );
  }
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
                기록 추가하기
              </ContentTopButton></ContentTopButtons>
            ) : (
              records.length > 0 && (
                <ContentTopButtons><ContentTopButton
                  onClick={() => setSorting(true)}
                >
                  <SortIcon />
                  {sort === 'DESC' ? '최신순' : '과거순'}
                </ContentTopButton></ContentTopButtons>
              )
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
                        {scope === 'sober' && (
                          <span className="ml-2 text-sm text-theme-text-secondary">
                            {record.type === 'RESTART' ? '다시 시작' : '기록'}
                          </span>
                        )}
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
                    <p className="whitespace-pre-wrap text-sm tracking-tighter text-theme-text-secondary">
                      {record.memo || '내용 없이 다시 시작했어요.'}
                    </p>
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
            {error && (
              <p role="alert" className="text-theme-danger">
                {error}
              </p>
            )}
          </div>
        </BottomSheetBody>
      </BottomSheet>
      {menu && (
        <BottomSheetPicker
          labelledBy="record-actions"
          onClose={() => {
            setMenu(null);
          }}
          header={
            <BottomSheetHeading id="record-actions">
              기록
            </BottomSheetHeading>
          }
        >
          <div className="flex flex-col gap-3 pb-6">
              <>
                <button
                  className="min-h-16 rounded-2xl border border-theme-border/50 p-4 text-left"
                  onClick={() => {
                    setEditing(menu);
                    setMenu(null);
                  }}
                >
                  기록 수정하기
                </button>
                <button
                  className="min-h-16 rounded-2xl border border-theme-border/50 p-4 text-left text-theme-danger"
                  onClick={() => {
                    setDeleting(menu);
                    setMenu(null);
                  }}
                >
                  기록 삭제하기
                </button>
              </>
          </div>
        </BottomSheetPicker>
      )}
      {deleting && (
        <BottomSheet
          ariaLabel="기록 삭제 확인"
          dismissible={!busy}
          onClose={() => setDeleting(null)}
        >
          <BottomSheetTitle title="기록을 삭제하시겠어요?" />
          <BottomSheetBody>
            <p className="py-4">
              {deleting.type === 'RESTART'
                ? '다시 시작 기록을 삭제하면 진행 기간과 통계가 다시 계산돼요.'
                : '기록이 삭제돼요.'}{' '}
              삭제 후 되돌릴 수 없어요.
            </p>
            <button
              disabled={busy}
              onClick={() =>
                void run(
                  () => authAction(() => deleteActivityRecord(scope, parentId, deleting.id)),
                  () => setDeleting(null),
                )
              }
              className="mb-6 min-h-12 w-full rounded-full bg-theme-danger text-theme-surface"
            >
              삭제하기
            </button>
            {error && <p role="alert">{error}</p>}
          </BottomSheetBody>
        </BottomSheet>
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

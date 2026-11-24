'use client';

import EmptyStateCard from '@/common/components/ui/EmptyStateCard';
import type { ActivityRecord } from '@/common/actions/records';
import ActivityRecordActions from '@/common/components/features/ActivityRecords/ActivityRecordActions';
import ActivityRecordFormModal from '@/common/components/features/ActivityRecords/ActivityRecordFormModal';
import { APP_LIST_COLUMNS } from '@/common/components/layout/AppPageContainer';
import { FEED_KIND_LABELS, type FeedActivity, type FeedItem } from '@/common/types/feed';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import DiaryCard from './DiaryCard';
import DiaryStatsPanel from './DiaryStatsPanel';
import FeedCardPhotos from './FeedCardPhotos';
import { SoberIcon } from '@/common/components/features/Sober/SoberIcon';
import HabitIcon from '@/common/components/ui/HabitIcon';
import ScrollableName from '@/common/components/ui/ScrollableName';
import { DIARY_TEXT_PREVIEW_LINE_COUNT } from '@/common/constants/diary';
import { MoreIcon } from '@/common/constants/appIcons';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  items: FeedItem[];
  hasAppliedFilter: boolean;
  inViewRef: (node?: Element | null) => void;
  onRetry?: () => void;
}

export default function FeedPageContent({ items, hasAppliedFilter, inViewRef, onRetry }: Props) {
  const [action, setAction] = useState<{ item: FeedActivity; editing: boolean } | null>(null);
  const firstImageDiary = items.find((item) => item.kind === 'diary' && item.diary.Images.length > 0);
  const record: ActivityRecord | null = action && {
    id: action.item.id,
    type: action.item.isRestart ? 'RESTART' : 'MEMO',
    recordedAt: action.item.recordedAt,
    memo: action.item.memo,
    images: action.item.images,
  };

  return (
    <section className={`grid w-full flex-1 gap-6 desktop:items-start ${APP_LIST_COLUMNS}`}>
      <div className="flex min-w-0 flex-col">
        {items.length === 0 ? (
          <EmptyStateCard
            description={hasAppliedFilter ? '필터에서 기록 종류나 기간을 바꿔 보세요.' : '일기, 습관, 거리두기에 남긴 기록을 여기서 볼 수 있어요.'}
            title={hasAppliedFilter ? '선택한 조건의 기록이 없어요.' : '아직 남긴 기록이 없어요.'}
          />
        ) : (
          <div className="flex w-full min-w-0 flex-col divide-y divide-theme-border/60">
            {items.map((item) => item.kind === 'diary'
              ? <DiaryCard key={`diary:${item.id}`} diaryData={item.diary} priorityImage={item === firstImageDiary} />
              : <FeedActivityCard
                  key={`${item.kind}:${item.id}`}
                  item={item}
                  onOpenMenu={() => setAction({ item, editing: false })}
                />
            )}
          </div>
        )}
        {onRetry && <button type="button" onClick={onRetry} className="min-h-12 text-theme-accent">기록을 불러오지 못했어요. 다시 시도</button>}
        <div ref={inViewRef} className="h-[50px] w-full shrink-0" />
      </div>
      <DiaryStatsPanel
        className="desktop:col-start-2 desktop:border-l desktop:border-theme-border/60 desktop:pl-8"
      />
      {action && record && (action.editing ? (
        <ActivityRecordFormModal
          scope={action.item.kind}
          parentId={action.item.parentId}
          name={action.item.name}
          initialStartedAt={action.item.initialStartedAt}
          record={record}
          day={null}
          onClose={() => setAction(null)}
        />
      ) : (
        <ActivityRecordActions
          scope={action.item.kind}
          parentId={action.item.parentId}
          record={record}
          onEdit={() => setAction({ ...action, editing: true })}
          onClose={() => setAction(null)}
        />
      ))}
    </section>
  );
}

function FeedActivityCard({ item, onOpenMenu }: { item: FeedActivity; onOpenMenu: () => void }) {
  const href = `/${item.kind}/${item.parentId}`;
  const date = format(parseLocalDate(item.date), 'yy년 M월 d일', { locale: ko });
  const hasImages = item.images.length > 0;
  const text = item.memo?.trim() ? item.memo : item.isRestart && !hasImages ? `${item.name} 다시 시작` : '';

  return (
    <article className="box-border flex w-full shrink-0 flex-col gap-4 py-6 first:pt-0">
      <div className="relative flex w-full min-w-0 items-center gap-3">
        <Link
          href={href}
          scroll={false}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            {item.kind === 'habit'
              ? <HabitIcon iconKey={item.iconKey} iconColor={item.iconColor} className="h-10 w-10" />
              : <SoberIcon name={item.iconKey} color={item.iconColor} className="h-10 w-10" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 items-baseline gap-1 text-base font-semibold text-theme-text-primary">
              <span className="shrink-0 whitespace-nowrap">{FEED_KIND_LABELS[item.kind]} ·</span>
              <ScrollableName name={item.name} />
            </span>
            <time dateTime={item.recordedAt} className="flex flex-wrap gap-x-2 text-sm text-theme-text-tertiary">
              <span className="whitespace-nowrap">{date}</span>
              <span>{item.timeLabel}</span>
            </time>
          </div>
        </Link>
        <button
          type="button"
          aria-label={`${item.name} 기록 수정·삭제 메뉴`}
          onClick={onOpenMenu}
          className="-mr-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-theme-text-tertiary"
        >
          <MoreIcon aria-hidden="true" />
        </button>
      </div>
      {(hasImages || text) && (
        <div className="flex h-auto w-full min-w-0 flex-col gap-3 p-2">
          {hasImages && <FeedCardPhotos images={item.images} href={href} label={item.name} />}
          {text && (
            <Link
              href={href}
              scroll={false}
              prefetch={false}
              className="block w-full min-w-0 text-left"
            >
              <span
                className="overflow-hidden whitespace-pre-wrap break-words text-base leading-7 text-theme-text-secondary [display:-webkit-box] [-webkit-box-orient:vertical]"
                style={{ WebkitLineClamp: DIARY_TEXT_PREVIEW_LINE_COUNT }}
              >
                {text}
              </span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

'use client';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { authAction } from '@/common/auth/authAction';
import { soberQueries } from '@/common/queries/soberQueries';
import {
  getSoberSummary,
  formatSoberDuration,
  getSoberDurationDistribution,
} from '@/common/functions/sober';
import { SoberIcon } from '@/common/components/features/Sober/SoberIcon';
import AppDotTabs, {
  dotTabMarkerClass,
  dotTabTitleClass,
} from '@/common/components/ui/AppDotTabs';
import InfoNotice from '@/common/components/ui/InfoNotice';

export default function SoberAnalysis() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useQuery(
    soberQueries.list(authAction),
  );
  const [shortest, setShortest] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const labels = [
    '3일 미만',
    '3일~1주',
    '1~2주',
    '2주~1개월',
    '1~3개월',
    '3개월 이상',
  ];
  const distribution = getSoberDurationDistribution(data ?? [], now);
  const records = (data ?? [])
    .flatMap((item) =>
      getSoberSummary(item, item.restarts, now).records.map((record) => ({
        item,
        record,
      })),
    )
    .sort(
      (a, b) =>
        (shortest
          ? a.record.duration - b.record.duration
          : b.record.duration - a.record.duration) ||
        a.item.id - b.item.id ||
        a.record.start - b.record.start,
    )
    .slice(0, 3);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3 py-2">
        <h2 className="shrink-0 text-xl font-bold">거리두기 기록</h2>
        <p className="text-right text-sm font-medium text-theme-text-secondary">
          전체 항목 {data?.length ?? 0}개
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        {!isPending && !isError && (
          <div className="flex min-w-0 flex-col gap-4">
            <h3
              className={`${dotTabTitleClass} mx-1 flex items-center gap-2`}
            >
              <span aria-hidden="true" className={dotTabMarkerClass} />
              유지 기간 분포
            </h3>
            <div className="mx-1 flex flex-col gap-6 rounded-theme border border-theme-accent/20 bg-theme-accent-light/50 px-4 py-6">
              <div
                className={`flex h-4 gap-0.5 overflow-hidden rounded-full ${data?.length ? '' : 'bg-theme-accent/30'}`}
                role="img"
                aria-label={labels.map((label, index) => `${label} ${distribution[index]}개`).join(', ')}
              >
                {distribution.map((count, index) => count > 0 && (
                  <span key={labels[index]} className="bg-theme-accent" style={{ flex: count, opacity: 0.25 + index * 0.15 }} />
                ))}
              </div>
              {data?.length ? (
                <div className="flex flex-col gap-4">
                  {distribution.map((count, index) => count > 0 && (
                    <div key={labels[index]} className="flex items-center gap-3">
                      <span className="h-4 w-4 shrink-0 rounded-full bg-theme-accent" style={{ opacity: 0.25 + index * 0.15 }} />
                      <span className="min-w-0 flex-1 text-sm">{labels[index]}</span>
                      <span className="text-sm text-theme-text-secondary">{count}개</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-sm text-theme-text-secondary">아직 거리두기 항목이 없어요.</p>}
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <AppDotTabs
              value={shortest ? 'short' : 'long'}
              onChange={(value) => setShortest(value === 'short')}
              options={[
                { value: 'long', label: '오래 유지한 순' },
                { value: 'short', label: '짧게 유지한 순' },
              ]}
            />
          </div>
          <div className="mx-1 rounded-theme border border-theme-text-secondary/10 bg-theme-surface-muted/60 p-6">
            {isPending ? (
              <p
                role="status"
                className="text-center text-sm text-theme-text-secondary"
              >
                기록을 불러오는 중이에요.
              </p>
            ) : isError ? (
              <div className="space-y-3 text-center">
                <p>거리두기 기록을 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="text-theme-accent"
                >
                  다시 시도
                </button>
              </div>
            ) : records.length ? (
              records.map(({ item, record }, index) => {
                const [days, hours, minutes] = formatSoberDuration(
                  record.duration,
                ).split(' ');
                const range = `${format(new Date(record.start), 'yy년 M월 d일 HH:mm')}부터 ${record.current ? '현재' : format(new Date(record.end), 'yy년 M월 d일 HH:mm')}까지`;
                return (
                  <button
                    type="button"
                    key={`${item.id}-${record.start}-${index}`}
                    aria-label={`${item.name}, ${record.current ? '진행 중' : '종료'}, ${formatSoberDuration(record.duration)}, ${range}, 거리두기 정보`}
                    onClick={() =>
                      router.push(`/sober/${item.id}`, { scroll: false })
                    }
                    className={`flex min-h-12 w-full items-center gap-4 text-left ${index ? 'pt-6' : ''} ${index < records.length - 1 ? 'border-b border-theme-border/50 pb-6' : ''}`}
                  >
                    <SoberIcon
                      name={item.iconKey}
                      color={item.iconColor}
                      className="h-9 w-9"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <ScrollableName
                        name={item.name}
                        className="text-base leading-relaxed"
                      />
                      <span
                        className={`text-sm ${record.current ? 'text-theme-accent' : 'text-theme-text-secondary'}`}
                      >
                        {record.current ? '진행 중' : '종료'}
                      </span>
                    </span>
                    <span className="flex shrink flex-col items-end gap-1">
                      <span className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold">
                          {days.slice(0, -1)}
                        </span>
                        <span className="text-base text-theme-text-secondary">
                          일
                        </span>
                      </span>
                      <span className="text-base text-theme-text-secondary">
                        {hours} {minutes}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-center text-sm text-theme-text-secondary">
                아직 거리두기 기록이 없어요.
              </p>
            )}
          </div>
          <InfoNotice>선택 연도와 관계없이 전체 기간 기록이에요.</InfoNotice>
        </div>
      </div>
    </section>
  );
}

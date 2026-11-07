'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authAction } from '@/common/auth/authAction';
import { soberQueries } from '@/common/queries/soberQueries';
import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { SoberDetail } from './SoberDetail';

export default function SoberDetailEntry({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useQuery(
    soberQueries.list(authAction),
  );
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const item = data?.find((entry) => entry.id === Number(id));
  const close = () => {
    if (window.history.length > 1) router.back();
    else router.replace('/sober');
  };
  if (!item)
    return (
      <BottomSheet ariaLabel="거리두기 상세 정보" onClose={close}>
        <BottomSheetTitle title="상세 정보" />
        <BottomSheetBody>
          <div className="pb-12 text-center text-sm text-theme-text-secondary">
            {isPending ? (
              '기록을 불러오는 중이에요.'
            ) : isError ? (
              <button type="button" onClick={() => void refetch()}>
                불러오지 못했어요. 다시 시도
              </button>
            ) : (
              '거리두기 항목을 찾을 수 없어요.'
            )}
          </div>
        </BottomSheetBody>
      </BottomSheet>
    );
  return (
    <SoberDetail
      item={item}
      now={now}
      onClose={close}
      onEdit={() => router.push(`/sober/${item.id}/edit`, { scroll: false })}
    />
  );
}

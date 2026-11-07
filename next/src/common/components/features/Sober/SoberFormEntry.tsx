'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authAction } from '@/common/auth/authAction';
import { soberQueries } from '@/common/queries/soberQueries';
import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { SoberForm } from './SoberForm';

export default function SoberFormEntry({ id }: { id?: string }) {
  const router = useRouter();
  const query = useQuery({ ...soberQueries.list(authAction), enabled: !!id });
  const item = query.data?.find((entry) => entry.id === Number(id));
  const close = () => {
    if (window.history.length > 1) router.back();
    else router.replace('/sober');
  };
  if (id && !item)
    return (
      <BottomSheet ariaLabel="거리두기 수정" onClose={close}>
        <BottomSheetTitle title="거리두기 수정" />
        <BottomSheetBody>
          <div className="pb-12 text-center text-sm text-theme-text-secondary">
            {query.isPending ? (
              '기록을 불러오는 중이에요.'
            ) : query.isError ? (
              <button type="button" onClick={() => void query.refetch()}>
                불러오지 못했어요. 다시 시도
              </button>
            ) : (
              '거리두기 항목을 찾을 수 없어요.'
            )}
          </div>
        </BottomSheetBody>
      </BottomSheet>
    );
  return <SoberForm item={item} onClose={close} />;
}

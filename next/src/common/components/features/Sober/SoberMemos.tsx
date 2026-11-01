'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { authAction } from '@/common/auth/authAction';
import { getSoberMemos } from '@/common/actions/sober';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import SortPicker from '@/common/components/ui/SortPicker';
import { MoreIcon, SortIcon } from '@/common/constants/appIcons';

export default function SoberMemos({ soberId, name, onClose, onMenu }: { soberId: number; name: string; onClose: () => void; onMenu: (id: number) => void }) {
  const [sort, setSort] = useState<'ASC' | 'DESC'>('DESC');
  const [sorting, setSorting] = useState(false);
  const query = useInfiniteQuery({
    queryKey: ['sober', 'memos', soberId, sort],
    queryFn: ({ pageParam }) => authAction(() => getSoberMemos(soberId, sort, pageParam)),
    initialPageParam: null as { restartedAt: string; id: number } | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  return <>
    <PanelDialog ariaLabel={`${name} 메모`} onClose={onClose}><PanelHeader title={`${name} 메모`} /><PanelBody showScrollFade><div className="flex flex-col gap-3 pb-7 pt-6">
      <button type="button" aria-label={`메모 기록 정렬, ${sort === 'DESC' ? '최신순' : '과거순'}`} onClick={() => setSorting(true)} className="mb-3 flex min-h-11 items-center gap-1 self-end text-sm text-theme-accent"><SortIcon />{sort === 'DESC' ? '최신순' : '과거순'}</button>
      {query.isPending ? <p role="status" className="py-16 text-center text-theme-text-secondary">메모 기록 불러오는 중</p> : query.isError && !query.data ? <div className="space-y-3 py-16 text-center"><p>메모 기록을 불러오지 못했어요.</p><button type="button" onClick={() => void query.refetch()} className="text-theme-accent">다시 시도</button></div> : items.length ? items.map((record, index) => {
        const date = format(new Date(record.restartedAt), 'yyyy-MM-dd');
        const first = index === 0 || date !== format(new Date(items[index - 1].restartedAt), 'yyyy-MM-dd');
        return <div key={record.id} className="space-y-3">{first && <h3 className={`font-semibold ${index ? 'pt-6' : ''}`}>{format(new Date(record.restartedAt), 'yyyy년 M월 d일')}</h3>}<div className="space-y-2 rounded-2xl border border-theme-border/50 p-4"><div className="flex items-center justify-between gap-3"><span>{format(new Date(record.restartedAt), 'HH:mm')}</span><button type="button" aria-label={`${format(new Date(record.restartedAt), 'HH:mm')} 다시 시작 기록 메뉴`} onClick={() => onMenu(record.id)} className="-mr-5 flex h-11 w-11 items-center justify-center text-xl text-theme-text-secondary"><MoreIcon /></button></div><p className="whitespace-pre-wrap text-sm tracking-tighter text-theme-text-secondary">{record.memo}</p></div></div>;
      }) : <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><p>아직 남긴 메모가 없어요.</p><p className="text-sm text-theme-text-secondary">다시 시작할 때 남긴 메모를 여기서 모아볼 수 있어요.</p></div>}
      {query.isError && query.data && <div role="alert" className="space-y-2 text-center"><p className="text-sm text-theme-text-secondary">{query.isFetchNextPageError ? '다음 메모를 불러오지 못했어요.' : '메모 기록을 새로 불러오지 못했어요.'}</p><button type="button" onClick={() => { if (query.isFetchNextPageError) void query.fetchNextPage(); else void query.refetch(); }} className="min-h-11 text-theme-accent">다시 시도</button></div>}
      {query.hasNextPage && !query.isFetchNextPageError && <button type="button" disabled={query.isFetching} onClick={() => void query.fetchNextPage()} className="min-h-11 text-theme-accent disabled:opacity-40">{query.isFetchingNextPage ? '메모 기록 더 불러오는 중' : '더 보기'}</button>}
    </div></PanelBody></PanelDialog>
    <AnimatePresence>{sorting && <SortPicker title="메모 기록 정렬" sortLabel="다시 시작 일시 정렬" value={sort} options={[{ value: 'DESC', label: '최신순' }, { value: 'ASC', label: '과거순' }]} onClose={() => setSorting(false)} onApply={(value) => { setSort(value); setSorting(false); }} />}</AnimatePresence>
  </>;
}

'use client';

import { deleteActivityRecord, type ActivityRecord, type RecordScope } from '@/common/actions/records';
import { authAction } from '@/common/auth/authAction';
import Menus from '@/common/components/ui/Menus';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { FEED_QUERY_KEY } from '@/common/constants/diary';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function ActivityRecordActions({ scope, parentId, record, onEdit, onClose, onBusyChange }: {
  scope: RecordScope;
  parentId: number;
  record: ActivityRecord;
  onEdit: () => void;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const client = useQueryClient();
  const [isOpen, setOpen] = useState(true);
  const title = scope === 'habit' ? '습관 기록' : record.type === 'RESTART' ? '다시 시작 기록' : '거리두기 기록';

  const remove = async () => {
    onBusyChange?.(true);
    try {
      await authAction(() => deleteActivityRecord(scope, parentId, record.id));
      await Promise.all([
        client.invalidateQueries({ queryKey: [scope] }),
        client.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      ]);
      showNotice('기록 삭제 완료');
    } finally {
      onBusyChange?.(false);
    }
  };

  return (
    <Menus
      isOpen={isOpen}
      kind="record"
      title={title}
      onClose={() => setOpen(false)}
      onDismissed={onClose}
      onEdit={onEdit}
      onDelete={remove}
      deleteDescription={record.type === 'RESTART'
        ? '이 기록을 삭제하면 진행 기간과 통계가 다시 계산돼요. 삭제 후 되돌릴 수 없어요.'
        : '이 기록과 사진이 삭제되며 되돌릴 수 없어요.'}
    />
  );
}

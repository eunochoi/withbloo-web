'use client';

import { saveActivityRecord, type ActivityRecord, type RecordScope } from '@/common/actions/records';
import { authAction } from '@/common/auth/authAction';
import type { BottomSheetHandle } from '@/common/components/ui/BottomSheet/BottomSheet';
import { uploadImagesAndCollectIds } from '@/common/components/ui/ImageAttachments/uploadImagesAndCollectIds';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import ActivityRecordForm from './ActivityRecordForm';

export default function ActivityRecordFormModal({ scope, parentId, initialStartedAt, record, day, onClose }: {
  scope: RecordScope;
  parentId: number;
  initialStartedAt: Date | string;
  record: Partial<ActivityRecord>;
  day: string | null;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const sheet = useRef<BottomSheetHandle>(null);
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const now = new Date();
  let initial = record.recordedAt ? new Date(record.recordedAt) : day ? new Date(`${day}T${format(now, 'HH:mm')}`) : now;
  if (!record.recordedAt && +initial < +new Date(initialStartedAt)) initial = new Date(initialStartedAt);

  return <ActivityRecordForm
    sheetRef={sheet} initialStartedAt={initialStartedAt} scope={scope} parentId={parentId}
    recordType={record.type ?? 'MEMO'} errorMessage={error} editing={!!record.id}
    initialValue={format(initial, "yyyy-MM-dd'T'HH:mm")} initialMemo={record.memo ?? ''}
    initialImages={record.images ?? []} saving={saving} onClose={onClose}
    onSave={async (value, memo, images, type) => {
      if (lock.current) return;
      lock.current = true;
      setSaving(true);
      setError('');
      try {
        const { imageContentIds } = await uploadImagesAndCollectIds(images);
        await authAction(() => saveActivityRecord(scope, parentId, {
          id: record.id, type, recordedAt: new Date(value).toISOString(), memo, imageContentIds,
        }));
        await client.invalidateQueries({ queryKey: [scope] });
        sheet.current?.close();
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : '저장하지 못했어요.');
      } finally {
        lock.current = false;
        setSaving(false);
      }
    }} />;
}

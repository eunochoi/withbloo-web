import {
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
  InfoIcon,
} from '@/common/constants/appIcons';
import { AnimatePresence } from 'framer-motion';
import { useId, useRef, useState } from 'react';

import { ConfirmDialog } from '../Dialog/ConfirmDialog';
import { PickerDialog } from '../Dialog/PickerDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  kind: 'diary' | 'habit' | 'sober';
  onDetail?: () => void;
  onEdit: () => void;
  onDelete: () => Promise<unknown> | void;
  onDeleted?: () => void;
}

const Menus = ({
  isOpen,
  onClose,
  title,
  kind,
  onDetail,
  onEdit,
  onDelete,
  onDeleted,
}: Props) => {
  const id = useId();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const pendingAction = useRef<'detail' | 'edit' | 'confirm' | null>(null);
  const label =
    kind === 'diary' ? '일기' : kind === 'sober' ? '거리두기' : '습관';
  const actions = [
    ...(onDetail
      ? [
          {
            key: 'detail' as const,
            icon: InfoIcon,
            title: '상세보기',
            description:
              kind === 'diary'
                ? '일기와 사진을 자세히 확인해요.'
                : kind === 'sober'
                  ? '거리두기 현황과 기록을 확인해요.'
                  : '습관과 기록 흐름을 확인해요.',
          },
        ]
      : []),
    {
      key: 'edit' as const,
      icon: EditIcon,
      title: kind === 'sober' ? '수정하기' : `${label} 수정하기`,
      description:
        kind === 'diary'
          ? '내용과 사진을 수정해요.'
          : kind === 'sober'
            ? '이름·목표·아이콘을 바꿔요.'
            : '이름·우선순위 등을 바꿔요.',
    },
    {
      key: 'confirm' as const,
      icon: DeleteIcon,
      title: kind === 'sober' ? '삭제하기' : `${label} 삭제하기`,
      description:
        kind === 'diary'
          ? '일기와 사진을 삭제해요.'
          : kind === 'sober'
            ? '항목과 재시작 기록을 삭제해요.'
            : '습관과 모든 기록을 삭제해요.',
    },
  ];

  return (
    <>
      <AnimatePresence
        onExitComplete={() => {
          const action = pendingAction.current;
          pendingAction.current = null;
          if (action === 'detail') onDetail?.();
          if (action === 'edit') onEdit();
          if (action === 'confirm') setIsConfirmingDelete(true);
        }}
      >
        {isOpen && (
          <PickerDialog labelledBy={`${id}-title`} onClose={onClose} header={<div className="flex flex-col items-center gap-2">
                <h2
                  id={`${id}-title`}
                  className="text-center text-lg font-semibold tracking-tight text-theme-text-primary"
                >
                  {title}
                </h2>
              </div>}>
            <div className="flex w-full flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))]">

              <div className="flex flex-col gap-3">
                {actions.map(
                  ({ key, icon: Icon, title: actionTitle, description }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        pendingAction.current = key;
                        onClose();
                      }}
                      className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70"
                    >
                      <Icon
                        className={`shrink-0 text-2xl ${key === 'confirm' ? 'text-theme-danger' : 'text-theme-accent'}`}
                        aria-hidden="true"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span
                          className={`text-base font-semibold ${key === 'confirm' ? 'text-theme-danger' : 'text-theme-text-primary'}`}
                        >
                          {actionTitle}
                        </span>
                        <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">
                          {description}
                        </span>
                      </span>
                      <ChevronRightIcon
                        className="shrink-0 text-xl text-theme-text-tertiary"
                        aria-hidden="true"
                      />
                    </button>
                  ),
                )}
              </div>
            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title={
          kind === 'sober'
            ? '이 거리두기를 삭제할까요?'
            : '정말 삭제하시겠어요?'
        }
        confirmLabel="삭제하기"
        confirmDescription={kind === 'diary' ? '일기와 사진이 삭제되며 되돌릴 수 없어요.' : kind === 'sober' ? '거리두기와 모든 다시 시작 기록이 삭제되며 되돌릴 수 없어요.' : '습관과 모든 기록이 삭제되며 되돌릴 수 없어요.'}
        danger
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={onDelete}
        onConfirmed={onDeleted}
      />
    </>
  );
};

export default Menus;

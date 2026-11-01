import { AddIcon, CloseIcon, DragIcon } from '@/common/constants/appIcons';
import { DIARY_IMAGE_ALLOWED_MIME_TYPES, DIARY_IMAGE_MAX_COUNT } from '@/common/constants/image';
import { cn } from '@/common/utils/cn';
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

import type { DiaryImageDraft } from './types';

const tileClass = 'relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl';
const imageControlClass = 'flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-40';

interface Props {
  diaryImages: DiaryImageDraft[];
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (image: DiaryImageDraft) => string;
  handleRemoveImage: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  isLoading: boolean;
}

const SortableDiaryImage = ({ id, src, index, disabled, onRemove }: {
  id: string;
  src: string;
  index: number;
  disabled: boolean;
  onRemove: () => void;
}) => {
  const reducedMotion = useReducedMotion();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition: reducedMotion ? undefined : transition }}
      className={cn(tileClass, isDragging ? 'bg-theme-accent/10' : 'shadow-card')}
    >
      <div className={cn('relative h-full w-full touch-auto', isDragging && 'opacity-0')}>
        <Image src={src} alt={`첨부 사진 ${index + 1}`} width={192} height={224} sizes="96px" unoptimized={src.startsWith('blob:')} draggable={false} className="h-full w-full object-cover" />
        <span className={cn('absolute bottom-2 left-2 text-xs', imageControlClass)}>{index + 1}</span>
      </div>
      <button
        type="button"
        aria-label={`사진 ${index + 1} 삭제`}
        disabled={disabled}
        onClick={onRemove}
        className={cn('absolute right-2 top-2', imageControlClass, isDragging && 'invisible')}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`사진 ${index + 1} 순서 변경`}
        disabled={disabled}
        onContextMenu={(event) => event.preventDefault()}
        className={cn('absolute bottom-2 right-2 cursor-grab touch-none active:cursor-grabbing disabled:cursor-default', imageControlClass, isDragging && 'invisible')}
      >
        <DragIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

const DiaryFormImages = ({ diaryImages, handleImageChange, getImageUrl, handleRemoveImage, onReorder, isLoading }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Object identity survives reordering, even for files with identical names.
  const imageIds = useRef(new WeakMap<DiaryImageDraft, string>());
  const nextId = useRef(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = fileInputRef.current?.closest('dialog');
    setOverlayContainer(dialog instanceof HTMLElement ? dialog : document.body);
  }, []);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const items = diaryImages.map((image) => {
    let id = imageIds.current.get(image);
    if (!id) {
      id = `diary-photo-${nextId.current++}`;
      imageIds.current.set(image, id);
    }
    return { id, src: getImageUrl(image) };
  });
  const activeItem = items.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        screenReaderInstructions: { draggable: '스페이스 키로 사진을 선택하고 좌우 방향키로 이동한 뒤 스페이스 키로 놓으세요. Escape 키로 취소합니다.' },
        announcements: {
          onDragStart: ({ active }) => `사진 ${items.findIndex((item) => item.id === active.id) + 1}을 선택했습니다.`,
          onDragOver: ({ over }) => over ? `${items.findIndex((item) => item.id === over.id) + 1}번째 위치로 이동합니다.` : undefined,
          onDragEnd: ({ over }) => over ? `${items.findIndex((item) => item.id === over.id) + 1}번째 위치에 놓았습니다.` : '순서 변경을 취소했습니다.',
          onDragCancel: () => '순서 변경을 취소했습니다.',
        },
      }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        if (isLoading || !over || active.id === over.id) return;
        const from = items.findIndex((item) => item.id === active.id);
        const to = items.findIndex((item) => item.id === over.id);
        if (from >= 0 && to >= 0) onReorder(from, to);
      }}
    >
      <div className="flex w-full gap-3 overflow-x-auto py-2">
        <SortableContext items={items.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableDiaryImage key={item.id} {...item} index={index} disabled={isLoading} onRemove={() => handleRemoveImage(index)} />
          ))}
        </SortableContext>
        {diaryImages.length < DIARY_IMAGE_MAX_COUNT && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(tileClass, 'flex flex-col items-center justify-center gap-2 border border-dashed border-theme-accent bg-theme-surface/40 text-theme-text-secondary disabled:opacity-40')}
          >
            <AddIcon aria-hidden="true" className="h-7 w-7 text-theme-accent" />
            <span className="text-xs">사진 추가</span>
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={DIARY_IMAGE_ALLOWED_MIME_TYPES.join(',')} name="image" multiple hidden disabled={isLoading} onChange={handleImageChange} />
      {/* Keep the preview in the dialog top layer, outside the animated panel. */}
      {overlayContainer && createPortal(
        <DragOverlay dropAnimation={null} style={{ pointerEvents: 'none' }}>
          {activeItem && (
            <div className={cn(tileClass, 'ring-2 ring-theme-accent shadow-theme-floating')}>
              <Image src={activeItem.src} alt="이동 중인 사진" width={192} height={224} sizes="96px" unoptimized={activeItem.src.startsWith('blob:')} draggable={false} className="h-full w-full object-cover" />
            </div>
          )}
        </DragOverlay>,
        overlayContainer,
      )}
    </DndContext>
  );
};

export default DiaryFormImages;

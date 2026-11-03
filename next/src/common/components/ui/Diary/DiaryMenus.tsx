import { deleteDiary } from "@/common/actions/diary";
import { authAction } from "@/common/auth/authAction";
import Menus from '@/common/components/ui/Menus';
import { showNotice } from '@/common/components/ui/Notice/notice';
import type { DiaryMenuData } from "@/common/types/diary";
import { parseLocalDate } from "@/common/utils/date/parseLocalDate";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface Props {
  isMenuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  diaryData: DiaryMenuData;
  onDeleted?: () => void;
  showDetail?: boolean;
}

const DiaryMenus = ({ isMenuOpen, setMenuOpen, diaryData, onDeleted, showDetail = false }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const onDelete = async () => {
    try {
      await authAction(() => deleteDiary({ id: diaryData.id }));
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['diary-habit', 'month'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showNotice('일기 삭제 완료');
    } catch (error) {
      throw error;
    }
  };
  const dateLabel = format(parseLocalDate(diaryData.date), 'yyyy년 M월 d일');

  return (
    <Menus
      isOpen={isMenuOpen}
      onClose={() => setMenuOpen(false)}
      title={`${dateLabel} 일기`}
      kind="diary"
      onDetail={showDetail ? () => router.push(`/diary/${diaryData.id}`, { scroll: false }) : undefined}
      onEdit={() => router.push(`/diary/${diaryData.id}/edit`, { scroll: false })}
      onDelete={onDelete}
      onDeleted={onDeleted}
    />
  );
};

export default DiaryMenus;

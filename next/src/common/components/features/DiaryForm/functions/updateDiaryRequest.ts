import { updateDiary } from '@/common/actions/diary';
import { authAction } from '@/common/auth/authAction';
import type { DiaryData } from '@/common/types/diary';

type UpdateDiaryRequestParams = {
  diaryId: string;
  date: string;
  text: string;
  emotion: number;
  imageContentIds: string[];
};

export const updateDiaryRequest = async ({
  diaryId,
  date,
  text,
  emotion,
  imageContentIds,
}: UpdateDiaryRequestParams): Promise<DiaryData> =>
  authAction(() =>
    updateDiary({
      diaryId,
      date,
      text,
      emotion,
      imageContentIds,
    }),
  );

import type { Prisma } from '@prisma/client';
import type { DiarySort } from '../../../types/sort';

export type DiaryData = {
  email: string;
  id: number;
  date: string;
  text: string;
  emotion: number;
  Images: {
    id: string;
    imageContentId: string;
    src: string;
    order: number | null;
  }[];
  Habits: {
    UserId: number;
    id: number;
    email: string;
    name: string;
    iconKey: string;
    iconColor: string;
    priority: number;
  }[];
};

export type CreateDiaryParams = {
  date?: string;
  text: string;
  imageContentIds: string[];
  emotion: number;
};

export type UpdateDiaryParams = {
  diaryId?: string | null;
  date?: string;
  text: string;
  imageContentIds: string[];
  emotion: number;
};

export type DeleteDiaryParams = {
  id: number;
};

export type IdParams = {
  id: string | number | null | undefined;
};

export type DateParams = {
  date: string;
};

export type DiaryListParams = {
  sortType: DiarySort;
  search: number;
  limit: number;
  pageParam: number;
  selectedMonth: number;
  selectedYear: number | null;
  seasons?: string[];
  emotionGroups?: string[];
};

export type DiaryWithRelations = Prisma.DiaryGetPayload<{
  include: {
    images: {
      include: {
        imageContent: true;
      };
    };
  };
}>;

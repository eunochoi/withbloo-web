
export interface DiaryImage {
  id: string;
  imageContentId: string;
  src: string;
  order: number | null;
}

export interface DiaryHabit {
  UserId: number;
  id: number;
  email: string;
  name: string;
  iconKey: string;
  iconColor: string;
  priority: number;
}

export interface DiaryData {
  email: string;
  id: number;
  date: string;           // yyyy-MM-dd
  text: string;
  emotion: number;        // 0~11 감정
  Images: DiaryImage[];
  Habits: DiaryHabit[];
}

export type DiaryMenuData = Pick<DiaryData, 'date' | 'id' | 'emotion'>;

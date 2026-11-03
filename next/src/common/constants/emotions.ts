import { StaticImageData } from 'next/image';

import angry from '/public/img/emotion/basic/angry.png';
import anxious from '/public/img/emotion/basic/anxious.png';
import calm from '/public/img/emotion/basic/calm.png';
import confused from '/public/img/emotion/basic/confused.png';
import happy from '/public/img/emotion/basic/happy.png';
import joyful from '/public/img/emotion/basic/joyful.png';
import love from '/public/img/emotion/basic/love.png';
import sad from '/public/img/emotion/basic/sad.png';
import surprised from '/public/img/emotion/basic/surprised.png';
import unknown from '/public/img/emotion/basic/unknown.png';
import tired from '/public/img/emotion/basic/tired.png';
import mixed from '/public/img/emotion/basic/mixed.png';

export interface Emotion {
  id: number;
  name: string;
  nameKr: string;
  src: StaticImageData;
  color: string;
  emoji: string;
}

// 감정 데이터 (인덱스 = id)
// 순서: 긍정적 감정 → 중립 → 부정적 감정 → 혼란 → ?
export const EMOTIONS: Emotion[] = [
  { id: 0, name: 'happy', nameKr: '행복', src: happy, color: '#f4b3b9', emoji: '🙂' },
  { id: 1, name: 'joyful', nameKr: '기쁨', src: joyful, color: '#fbc833', emoji: '😄' },
  { id: 2, name: 'love', nameKr: '사랑', src: love, color: '#fb748e', emoji: '😍' },
  { id: 3, name: 'calm', nameKr: '평온', src: calm, color: '#92d4c7', emoji: '😌' },
  { id: 4, name: 'surprised', nameKr: '놀람', src: surprised, color: '#ffb988', emoji: '😮' },
  { id: 5, name: 'anxious', nameKr: '불안', src: anxious, color: '#a4aabd', emoji: '😰' },
  { id: 6, name: 'sad', nameKr: '슬픔', src: sad, color: '#8fbffb', emoji: '😢' },
  { id: 7, name: 'angry', nameKr: '화남', src: angry, color: '#ff6b66', emoji: '😠' },
  { id: 8, name: 'confused', nameKr: '혼란', src: confused, color: '#ceb1ef', emoji: '😕' },
  { id: 9, name: 'unknown', nameKr: '무덤덤', src: unknown, color: '#d9dded', emoji: '😐' },
  { id: 10, name: 'tired', nameKr: '나른함', src: tired, color: '#B7AAA4', emoji: '😮‍💨' },
  { id: 11, name: 'mixed', nameKr: '싱숭생숭', src: mixed, color: '#B5BDD5', emoji: '🫤' },
];

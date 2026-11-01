import type { Metadata } from 'next';

import IntroClientPage from './IntroClientPage';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: "감정 일기와 작은 실천으로 나를 돌보는 '위블'을 소개해요.",
};

const IntroServerPage = () => <IntroClientPage />;

export default IntroServerPage;

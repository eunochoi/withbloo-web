import type { Metadata } from 'next';

import PrivacyClientPage from './PrivacyClientPage';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'eooooostudio가 제공하는 \'위블\' - 감정 일기 · 습관 관리 앱의 개인정보 수집과 이용, 보관 및 삭제 방침을 안내합니다.',
};

const PrivacyServerPage = () => <PrivacyClientPage />;

export default PrivacyServerPage;

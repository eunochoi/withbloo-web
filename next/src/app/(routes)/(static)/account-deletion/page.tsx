import type { Metadata } from 'next';

import AccountDeletionClientPage from './AccountDeletionClientPage';

export const metadata: Metadata = {
  title: '계정 삭제',
  description: 'eooooostudio가 제공하는 \'위블\' - 감정 일기 · 습관 관리 앱의 계정 및 관련 데이터 삭제 방법과 문의 안내입니다.',
};

const AccountDeletionServerPage = () => {
  return <AccountDeletionClientPage />;
};

export default AccountDeletionServerPage;

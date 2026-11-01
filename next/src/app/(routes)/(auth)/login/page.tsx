import type { Metadata } from 'next';

import LoginClientPage from '../LoginClientPage';

export const metadata: Metadata = {
  title: '로그인',
  description: "Google 계정으로 로그인하고 '위블'에서 오늘의 마음을 남겨요.",
};

const LoginServerPage = () => <LoginClientPage />;

export default LoginServerPage;

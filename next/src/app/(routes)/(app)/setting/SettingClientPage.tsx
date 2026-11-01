'use client';

import AppPageLayout from '@/common/components/layout/AppPageLayout';
import { useCurrentUser } from '@/common/hooks/useCurrentUser';
import { usePrefetchPage } from '@/common/hooks/usePrefetchPage';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import SettingPageLinks from './_components/SettingPageLinks';
import SettingPageContent from './_components/SettingPageContent';
import AppPageTitle from '@/common/components/layout/AppPageTitle';

const SettingClientPage = () => {
  usePrefetchPage();

  const router = useRouter();
  const { data: user } = useCurrentUser();
  const email = user?.email ?? '-';
  const provider = user?.provider ?? '-';
  const createAt = user?.createdAt ? format(user.createdAt, 'yyyy.MM.dd') : '-';

  return (
    <AppPageLayout
      header={<AppPageTitle title="앱 설정" hashtags="#맞춤 #취향" />}
      toolbar={<SettingPageLinks />}
    >
      <SettingPageContent
        email={email}
        provider={provider}
        createAt={createAt}
        onDeleteAccount={() => router.push('/account-deletion')}
      />
    </AppPageLayout>
  );
};

export default SettingClientPage;

'use client';

import { useOpenOnboarding } from '@/common/components/features/Onboarding/OnboardingProvider';
import Toolbar from '@/common/components/ui/Toolbar';

import {
  ExternalLinkIcon,
  InfoIcon,
  PrivacyIcon,
} from '@/common/constants/appIcons';

import ToolbarButton from '@/common/components/ui/ToolbarButton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SettingPageLinks = () => {
  const router = useRouter();
  const openOnboarding = useOpenOnboarding();
  return (
    <Toolbar className="flex-wrap gap-x-3 gap-y-1">
      <ToolbarButton onClick={openOnboarding} aria-label="사용 안내 다시 보기">
        <InfoIcon size={18} aria-hidden="true" />
        <span className="whitespace-nowrap">안내</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => router.push('/privacy')}
        aria-label="개인정보처리방침"
      >
        <PrivacyIcon size={18} aria-hidden="true" />
        <span className="whitespace-nowrap">개인정보처리방침</span>
      </ToolbarButton>
      <Link
        href="/intro"
        aria-label="서비스 소개 웹사이트 열기"
        title="서비스 소개 웹사이트 열기"
        className="ml-auto flex min-h-10 shrink-0 items-center justify-center rounded-md px-1 text-theme-accent hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent"
      >
        <ExternalLinkIcon size={18} aria-hidden="true" />
      </Link>
    </Toolbar>
  );
};

export default SettingPageLinks;

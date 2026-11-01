'use client';

import DocContent from '@/common/components/ui/Doc/DocContent';
import DocHeader from '@/common/components/ui/Doc/DocHeader';
import DocLayout from '@/common/components/ui/Doc/DocLayout';
import { PRIVACY_CONTENTS } from './_constants';

const PrivacyClientPage = () => (
  <DocLayout>
    <DocHeader
      title="개인정보처리방침"
      subtitle="Privacy Policy"
      description="eooooostudio가 제공하는 '위블' - 감정 일기 · 습관 관리 앱에 적용되는 개인정보처리방침입니다."
    />
    {PRIVACY_CONTENTS.map((content) => (
      <DocContent key={content.title} {...content} />
    ))}
  </DocLayout>
);

export default PrivacyClientPage;

'use client';

import DocCard from '@/common/components/ui/Doc/DocCard';
import DocContent from '@/common/components/ui/Doc/DocContent';
import DocHeader from '@/common/components/ui/Doc/DocHeader';
import DocLayout from '@/common/components/ui/Doc/DocLayout';
import Link from 'next/link';

import AccountDeletionSection from './_components/AccountDeletionSection';

const deletionData = [
  '\'위블\' 계정 정보',
  '일기와 감정 기록',
  '습관과 습관 체크 기록',
  '로그인 세션',
  '첨부 사진의 계정 연결 정보',
];

const AccountDeletionClientPage = () => {
  return (
    <DocLayout>
      <DocHeader
        title="계정 삭제"
        subtitle="Account deletion"
        description="'위블 - 감정 일기 · 습관 관리' 앱의 계정 및 관련 데이터 삭제 안내입니다. 앱을 설치하지 않아도 이 페이지에서 본인 확인 후 회원 탈퇴를 완료할 수 있습니다."
      />
      <DocContent
        title="계정 삭제 방법"
        paragraphs={[
          '앱 이름: \'위블\' - 감정 일기 · 습관 관리',
          '개발자: eooooostudio',
          '가입에 사용한 Google 계정으로 아래에서 로그인한 후, 확인 문구 ‘회원탈퇴’를 입력하고 ‘회원 탈퇴’ 버튼을 선택해주세요.',
          '회원 탈퇴가 완료되면 계정과 아래 데이터가 삭제되며 복구할 수 없습니다. Google 계정 자체가 삭제되는 것은 아닙니다.',
        ]}
      />
      <DocContent
        title="탈퇴 시 삭제되는 데이터"
        list={deletionData}
        closing={['다른 사용자가 참조하지 않는 첨부 사진 원본은 별도 저장소 정리 대상입니다.']}
      />
      <AccountDeletionSection />
      <DocCard className="select-text px-5 py-8 tablet:px-8 tablet:py-10">
        <h2 className="text-2xl leading-tight text-theme-text-primary">계정 삭제 문의</h2>
        <p className="mt-4 text-base leading-7 text-theme-text-secondary">
          로그인이나 회원 탈퇴가 어려운 경우, 가입에 사용한 이메일 주소와 함께 &quot;&apos;위블&apos; 계정 삭제 요청&quot; 제목으로 아래 이메일에 문의해주세요. 본인 확인 후 계정 삭제를 도와드립니다.
        </p>
        <a className="mt-3 inline-block break-all text-theme-accent underline" href="mailto:eooooostudio@gmail.com?subject=%27%EC%9C%84%EB%B8%94%27%20%EA%B3%84%EC%A0%95%20%EC%82%AD%EC%A0%9C%20%EC%9A%94%EC%B2%AD">
          eooooostudio@gmail.com
        </a>
      </DocCard>
      <div className="flex justify-center px-5 py-8">
        <Link className="text-sm text-theme-accent" href="/privacy">개인정보처리방침 보기</Link>
      </div>
    </DocLayout>
  );
};

export default AccountDeletionClientPage;

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollContainer } from '@/common/components/ui/ScrollContainer';
import Wordmark from '@/common/components/ui/Wordmark';
import { cn } from '@/common/utils/cn';
import IntroActionButtons from './_components/IntroActionButtons';
import IntroHero from './_components/IntroHero';
import IntroSection from './_components/IntroSection';
import { introContainerClass, introDescriptionClass, introSectionClass, introTitleClass } from './_styles/classes';
import positive from '/public/img/bloolog/cats/cat-blue-p.png';
import neutral from '/public/img/bloolog/cats/cat-blue.png';
import negative from '/public/img/bloolog/cats/cat-blue-n.png';

const IntroClientPage = () => (
  <ScrollContainer className="static-theme-blue h-[100dvh] w-full bg-theme-bg text-theme-text-primary" showScrollFade scrollFadeClassName="desktop:hidden">
    <IntroHero />
    <IntroSection title="안녕, 나는 블루야!" description={'마음에 따라 털색이 달라지는\n조금 특별한 고양이야.\n예전엔 파란 무늬를 지우고 싶었어.\n하지만 작은 고래 파인과 함께하며,\n파란 마음도 나의 일부임을 알아가고 있어.'}>
      <div className="grid grid-cols-3 gap-3 text-center text-sm text-theme-text-secondary">
        {[
          { src: positive, text: '기쁘고 설레는 날' },
          { src: neutral, text: '평범한 날' },
          { src: negative, text: '마음이 무거운 날' },
        ].map(({ src, text }) => (
          <div key={text}><Image src={src} alt="" sizes="(min-width: 1024px) 18vw, 30vw" className="w-full" /><p>{text}</p></div>
        ))}
      </div>
    </IntroSection>
    <IntroSection reverse title="오늘의 마음을 기록해요" description={'감정을 고르고, 글과 사진으로\n나만의 하루를 남겨요.'}>
      <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">감정 일기 · 사진 · 기록 필터</div>
    </IntroSection>
    <IntroSection title="나를 돌보는 작은 실천" description={'이어가고 싶은 습관은 더하고,\n줄이고 싶은 행동과는 잠시 거리를 둬요.'}>
      <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">습관 관리 · 자유 기록 · 거리두기</div>
    </IntroSection>
    <IntroSection reverse title="하루하루 쌓아온 나의 발자취" description={'달력과 통계에서 지난 감정과\n습관 기록을 돌아봐요.'}>
      <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">월간 기록 · 감정 통계 · 연속 기록</div>
    </IntroSection>
    <section className={cn(introSectionClass, 'bg-theme-surface')}>
      <div className={cn(introContainerClass, 'flex max-w-[760px] flex-col gap-8')}>
        <h2 className={introTitleClass}>웹과 앱에서 만나는 &apos;위블&apos;</h2>
        <div className="grid gap-6 tablet:grid-cols-2 text-theme-text-secondary leading-relaxed">
          <p><strong className="text-theme-text-primary">웹</strong><br />계정으로 로그인하고 서버에 기록을 저장해요. 휴대폰, 태블릿, PC에서 감정 일기와 습관, 거리두기를 기록해요.</p>
          <p><strong className="text-theme-text-primary">앱</strong><br />계정 없이 기기에 기록해요. 백업 파일로 기록을 보관하고 복원할 수 있어요.</p>
        </div>
        <p className={introDescriptionClass}>웹과 앱의 기록은 자동으로 연동되지 않아요.</p>
      </div>
    </section>
    <section className={cn(introSectionClass, 'bg-theme-accent-light')}>
      <div className={cn(introContainerClass, 'flex flex-col items-center gap-10 text-center')}>
        <Wordmark className="text-5xl desktop:text-6xl" />
        <h2 className={introTitleClass}>어떤 색의 하루라도, 블루와 함께.</h2>
        <p className={introDescriptionClass}>Bloom with Bloo and Blue.</p>
        <IntroActionButtons />
        <nav aria-label="서비스 정책" className="flex flex-wrap justify-center gap-6 text-sm text-theme-text-secondary">
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          <Link href="/account-deletion" className="hover:underline">계정 삭제</Link>
        </nav>
        <p className="text-sm text-theme-text-secondary">eooooostudio</p>
      </div>
    </section>
  </ScrollContainer>
);

export default IntroClientPage;

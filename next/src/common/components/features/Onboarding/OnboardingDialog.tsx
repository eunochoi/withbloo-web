'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import EmotionImage from '@/common/components/ui/EmotionImage';
import Wordmark from '@/common/components/ui/Wordmark';
import { EMOTIONS } from '@/common/constants/emotions';
import { FONT_SIZE_LIST } from '@/common/types/setting';
import { THEME_MODE_LIST } from '@/common/types/theme';
import { useSettingsContext } from '@/common/settings/useSettingsContext';
import positive from '/public/img/bloolog/cats/cat-blue-p.png';
import neutral from '/public/img/bloolog/cats/cat-blue.png';
import negative from '/public/img/bloolog/cats/cat-blue-n.png';

const titles = ['안녕, 나는 블루야!', '파란 마음도 나의 일부니까', '나에게 맞게 설정해요', '하루의 발자국을 남겨요', '소중한 기록을 보관해요'];
const moods = [
  { src: positive, label: '기쁘고 설레는 날', story: '기쁘고 설레는 날엔 분홍빛이 번져.' },
  { src: neutral, label: '평범한 날', story: '특별할 것 없는 날에도 나는 나야.' },
  { src: negative, label: '마음이 무거운 날', story: '마음이 무거운 날엔 파란 무늬가 넓어져.' },
];
const buttonClass = 'min-h-12 rounded-full border border-theme-accent/40 px-5 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent';

export function OnboardingDialog({ firstRun, onClose, onContinueWithoutSaving }: { firstRun: boolean; onClose: () => void; onContinueWithoutSaving: () => void }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(1);
  const [error, setError] = useState('');
  const [sessionOnly, setSessionOnly] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { font, theme } = useSettingsContext();
  const selectStep = (next: number) => {
    if (next < 0 || next >= titles.length) return;
    setStep(next);
    setError('');
    contentRef.current?.scrollTo({ top: 0 });
  };
  const finish = () => {
    try {
      onClose();
    } catch {
      setError('완료 상태를 저장하지 못했어요. 브라우저의 저장소 설정을 확인하고 다시 시도해주세요.');
      setSessionOnly(true);
    }
  };

  return (
    <PanelDialog ariaLabel="위블 사용 안내" dismissible={!firstRun} onClose={onClose}>
      <header className="shrink-0 px-6 pb-4 pt-5 text-center">
        <Wordmark className="text-3xl" />
        <p className="mt-4 text-sm text-theme-text-secondary" aria-live="polite">{step + 1} / {titles.length}</p>
        <h2 className="mt-2 break-keep text-2xl font-bold" tabIndex={-1}>{titles[step]}</h2>
      </header>
      <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 text-theme-text-primary">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 break-keep text-center text-base leading-7">
          {step === 0 && <>
            <p className="text-theme-text-secondary">나는 마음에 따라 털색이 달라지는<br />조금 특별한 샴 고양이야.</p>
            <Image src={moods[mood].src} alt={moods[mood].label + '의 블루'} sizes="280px" className="mx-auto w-full max-w-[280px]" />
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="블루의 마음 미리보기">
              {moods.map((item, index) => <button key={item.label} type="button" aria-pressed={mood === index} onClick={() => setMood(index)} className={`min-h-12 rounded-2xl border px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent ${mood === index ? 'border-theme-accent bg-theme-accent-light' : 'border-theme-border'}`}>{item.label}</button>)}
            </div>
            <p aria-live="polite">{moods[mood].story}</p>
          </>}
          {step === 1 && <>
            <Image src={neutral} alt="파랑과 분홍 무늬가 함께 있는 블루" sizes="240px" className="mx-auto w-full max-w-[240px]" />
            <p>예전엔 파란 무늬만 지우면<br />언제나 행복할 수 있을 거라 생각했어.</p>
            <p>작은 분홍 고래 파인은<br />파란색을 지워주진 않았어.<br />그저 내 곁에서 함께해 줬지.</p>
            <p>이제는 알아가고 있어.<br />파란 마음까지도 나의 일부라는 걸.</p>
            <p className="font-semibold text-theme-accent-text">어떤 색의 하루라도, 블루와 함께.</p>
          </>}
          {step === 2 && <>
            <p className="text-theme-text-secondary">지금 고른 모습이 바로 적용돼요.<br />설정에서 언제든 바꿀 수 있어요.</p>
            <fieldset className="text-left"><legend className="mb-3 font-semibold">배경</legend><div className="grid grid-cols-2 gap-3">{THEME_MODE_LIST.map(mode => <button type="button" key={mode} aria-pressed={theme.mode === mode} onClick={() => theme.setMode(mode)} className={`${buttonClass} ${theme.mode === mode ? 'bg-theme-accent-light ring-2 ring-theme-accent' : ''}`}>{mode}</button>)}</div></fieldset>
            <fieldset className="text-left"><legend className="mb-3 font-semibold">글자 크기</legend><div className="grid grid-cols-3 gap-3">{FONT_SIZE_LIST.map(size => <button type="button" key={size} aria-pressed={font.size === size} onClick={() => font.setFontSize(size)} className={`${buttonClass} px-2 ${font.size === size ? 'bg-theme-accent-light ring-2 ring-theme-accent' : ''}`}>{size}</button>)}</div></fieldset>
            <div className="rounded-2xl bg-theme-accent-light p-6">오늘의 마음도 나의 일부예요.<br />나에게 편안한 모습으로 기록해요.</div>
          </>}
          {step === 3 && <>
            <div className="flex justify-center gap-4" aria-hidden="true">{[EMOTIONS[0], EMOTIONS[3], EMOTIONS[6]].map(emotion => <EmotionImage key={emotion.id} emotion={emotion} alt="" width={56} height={56} />)}</div>
            <dl className="space-y-5 text-left">
              <div><dt className="font-semibold">감정 일기</dt><dd className="text-theme-text-secondary">감정을 고르고 글과 사진으로 하루를 남겨요. 발도장은 그날을 지나온 흔적이에요.</dd></div>
              <div><dt className="font-semibold">습관과 거리두기</dt><dd className="text-theme-text-secondary">이어가고 싶은 실천을 기록하고, 줄이고 싶은 행동과 거리를 둬요. 다시 시작해도 지난 시간은 사라지지 않아요.</dd></div>
              <div><dt className="font-semibold">달력과 돌아보기</dt><dd className="text-theme-text-secondary">달력에서 일기 발도장과 습관 진행바를 확인하고, 홈에서 기록의 흐름을 돌아봐요.</dd></div>
            </dl>
            <p className="rounded-2xl bg-theme-accent-light p-4 text-sm text-theme-text-secondary">자유 기록 습관은 완료율 계산에 포함되지 않아요.<br />기록이 없는 날도 나의 하루예요.</p>
          </>}
          {step === 4 && <>
            <p className="text-theme-text-secondary">{'\'위블\'에서 나의 속도로 기록해요.'}</p>
            <dl className="space-y-5 text-left">
              <div><dt className="font-semibold">계정으로 기록해요</dt><dd className="text-theme-text-secondary">웹 기록은 서버에 저장돼요. 같은 계정으로 로그인하면 다른 기기에서도 볼 수 있어요.</dd></div>
              <div><dt className="font-semibold">백업 파일로 보관해요</dt><dd className="text-theme-text-secondary">설정에서 기록과 사진을 비밀번호로 보호한 .bloo 파일로 저장할 수 있어요. 웹은 백업 저장만 지원하고, 복원은 앱에서 진행해요.</dd></div>
              <div><dt className="font-semibold">웹과 앱은 별도예요</dt><dd className="text-theme-text-secondary">앱은 계정 없이 기기에 기록해요. 웹과 앱의 기록은 자동으로 연동되지 않아요.</dd></div>
            </dl>
            <p className="text-sm text-theme-text-secondary">이 안내는 설정에서 다시 볼 수 있어요.</p>
          </>}
        </div>
      </div>
      <footer className="shrink-0 border-t border-theme-border px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        {error && <p role="alert" className="mb-3 text-sm text-theme-text-secondary">{error}</p>}
        {sessionOnly && <div className="mb-3 text-sm text-theme-text-secondary"><p>저장하지 않고 시작하면 다음 접속 때 안내가 다시 표시돼요.</p><button type="button" onClick={onContinueWithoutSaving} className="min-h-11 underline">저장하지 않고 시작하기</button></div>}
        <nav aria-label="사용 안내 단계" className="mb-3 flex justify-center gap-1">{titles.map((title, index) => <button type="button" key={title} aria-label={`${index + 1}단계: ${title}`} aria-current={index === step ? 'step' : undefined} onClick={() => selectStep(index)} className="flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent"><span className={`h-2.5 rounded-full ${index === step ? 'w-5 bg-theme-accent' : 'w-2.5 bg-theme-border'}`} /></button>)}</nav>
        <div className="mx-auto flex max-w-md gap-3">
          {step > 0 && <button type="button" className={`${buttonClass} flex-1`} onClick={() => selectStep(step - 1)}>이전</button>}
          <button type="button" className={`${buttonClass} flex-1 bg-theme-accent-light text-theme-accent-text`} onClick={() => step === titles.length - 1 ? finish() : selectStep(step + 1)}>{step === titles.length - 1 ? firstRun ? '시작하기' : '닫기' : '다음'}</button>
        </div>
      </footer>
    </PanelDialog>
  );
}

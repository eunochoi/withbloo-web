'use client';

import { EmotionIconStyleSelector } from '@/app/(routes)/(app)/setting/_components/EmotionIconStyleSelector';
import { FontTypeSelector } from '@/app/(routes)/(app)/setting/_components/FontTypeSelector';
import { ThemeColorSelector } from '@/app/(routes)/(app)/setting/_components/ThemeColorSelector';
import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { FONT_SIZE_LIST } from '@/common/types/setting';
import { THEME_MODE_LIST } from '@/common/types/theme';
import { sectionTitleClassName } from './styles';
import { OnboardingFrame } from './OnboardingFrame';
const choiceClass =
  'h-24 min-w-0 rounded-xl border px-2 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent';

export function ThemePage() {
  const { font, theme } = useSettingsContext();
  return (
    <OnboardingFrame
      title="내 취향대로 꾸며요"
      description="마음에 드는 색과 모습을 골라보세요."
      info="설정 페이지에서 언제든 다시 바꿀 수 있어요."
    >
      <section>
        <h3 className={sectionTitleClassName}>강조 색상</h3>
        <ThemeColorSelector />
      </section>
      <section className="space-y-3">
        <h3 className={sectionTitleClassName}>감정 아이콘</h3>
        <EmotionIconStyleSelector compact choiceClassName="h-24" />
      </section>
      <fieldset>
        <legend className={`mb-3 w-full ${sectionTitleClassName}`}>배경</legend>
        <div className="grid grid-cols-3 gap-2">
          {THEME_MODE_LIST.map((mode) => (
            <button
              type="button"
              key={mode}
              aria-pressed={theme.mode === mode}
              onClick={() => theme.setMode(mode)}
              className={`${choiceClass} ${theme.mode === mode ? 'border-theme-accent bg-theme-accent-light/50' : 'border-transparent'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </fieldset>
      <section className="space-y-3">
        <h3 className={sectionTitleClassName}>폰트 종류</h3>
        <FontTypeSelector choiceClassName="text-theme-text-primary" />
      </section>
      <fieldset>
        <legend className={`mb-3 w-full ${sectionTitleClassName}`}>
          글자 크기
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZE_LIST.map((size) => (
            <button
              type="button"
              key={size}
              aria-pressed={font.size === size}
              onClick={() => font.setFontSize(size)}
              className={`${choiceClass} ${font.size === size ? 'border-theme-accent bg-theme-accent-light/50' : 'border-transparent'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>
    </OnboardingFrame>
  );
}

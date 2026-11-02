import DiaryFormTextarea from './DiaryFormTextarea';

interface DiaryFormTextSectionProps {
  text: string;
  setText: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
}

const DiaryFormTextSection = ({ text, setText, onFocusChange }: DiaryFormTextSectionProps) => (
  <section aria-labelledby="diary-text-title" className="flex min-h-0 w-full flex-1 flex-col gap-3">
    <h2 id="diary-text-title" className=" text-lg font-semibold text-theme-text-primary">오늘의 이야기</h2>
    <DiaryFormTextarea text={text} setText={setText} onFocusChange={onFocusChange} />
  </section>
);

export default DiaryFormTextSection;

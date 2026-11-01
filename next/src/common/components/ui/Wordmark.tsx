import { twMerge } from 'tailwind-merge';

interface Props {
  accentColor?: string;
  className?: string;
}

const Wordmark = ({ className, accentColor = '#8CADE2' }: Props) => (
  <span
    role="img"
    aria-label="withBloo"
    className={twMerge('inline-block h-[1.35em] w-[4.2em] max-w-full shrink-0 align-middle text-[36px]', className)}
    style={{
      // 원본의 두 색 영역을 유지하면서 글자색만 현재 테마에 맞춘다.
      background: `linear-gradient(to right, rgb(var(--theme-text-primary)) 47.06%, ${accentColor} 47.06%)`,
      mask: 'url("/img/withbloo/wordmark.svg") center / contain no-repeat',
      WebkitMask: 'url("/img/withbloo/wordmark.svg") center / contain no-repeat',
    }}
  />
);

export default Wordmark;

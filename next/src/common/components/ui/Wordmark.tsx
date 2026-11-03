import { twMerge } from'tailwind-merge';

interface Props {
  accentColor?: string;
  className?: string;
}

const Wordmark = ({ className, accentColor ='rgb(var(--theme-accent))' }: Props) => (
  <span
    role="img"
    aria-label="withBloo"
    className={twMerge('relative inline-block h-[1.35em] w-[3.4525em] max-w-full shrink-0 align-middle text-[36px]', className)}
  >
    <span
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundColor: 'rgb(var(--theme-text-primary))',
        mask: 'url("/img/brand/withbloo-text-mask.png") center / contain no-repeat',
        WebkitMask: 'url("/img/brand/withbloo-text-mask.png") center / contain no-repeat',
      }}
    />
    <span
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundColor: accentColor,
        mask: 'url("/img/brand/withbloo-accent-mask.png") center / contain no-repeat',
        WebkitMask: 'url("/img/brand/withbloo-accent-mask.png") center / contain no-repeat',
      }}
    />
  </span>
);

export default Wordmark;

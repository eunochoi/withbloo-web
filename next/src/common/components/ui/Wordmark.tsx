import { twMerge } from 'tailwind-merge';

interface Props {
  accentColor?: string;
  className?: string;
  stacked?: boolean;
}

const horizontalLayers = [
  { part: 'text', file: 'withbloo-text-mask.png', accent: false, clipPath: undefined },
  { part: 'accent', file: 'withbloo-accent-mask.png', accent: true, clipPath: undefined },
];

// The stacked PNG's alpha channel preserves the lettering. Clip out the dot and lower line for the accent.
const stackedLayers = [
  {
    part: 'with',
    file: 'wordmark-stacked.png',
    accent: false,
    clipPath: 'polygon(0 0, 28% 0, 28% 20%, 38% 20%, 38% 0, 100% 0, 100% 46.4%, 0 46.4%)',
  },
  { part: 'dot', file: 'wordmark-stacked.png', accent: true, clipPath: 'inset(0 62% 80% 28%)' },
  { part: 'bloo', file: 'wordmark-stacked.png', accent: true, clipPath: 'inset(46.4% 0 0)' },
];

const Wordmark = ({ className, accentColor = 'rgb(var(--theme-accent))', stacked = false }: Props) => (
  <span
    role="img"
    aria-label="withBloo"
    className={twMerge(
      'relative inline-block max-w-full shrink-0 align-middle',
      stacked ? 'aspect-[256/237] w-full' : 'h-[1.35em] w-[3.4525em] text-[36px]',
      className,
    )}
  >
    {(stacked ? stackedLayers : horizontalLayers).map(({ part, file, accent, clipPath }) => {
      const mask = `url("/img/brand/${file}") center / contain no-repeat`;
      return (
        <span
          key={part}
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: accent ? accentColor : 'rgb(var(--theme-text-primary))',
            clipPath,
            mask,
            WebkitMask: mask,
          }}
        />
      );
    })}
  </span>
);

export default Wordmark;

import type { IconType } from 'react-icons';

interface IntroInfoCardProps {
  icon: IconType;
  title: string;
  description: string;
}

const IntroInfoCard = ({ icon: Icon, title, description }: IntroInfoCardProps) => (
  <div className="flex items-center gap-5 rounded-[20px] bg-theme-bg border border-theme-border/70 p-6 leading-8 text-theme-text-secondary">
    <Icon aria-hidden="true" className="shrink-0 text-4xl text-theme-accent" />
    <div className="min-w-0">
      <strong className="text-lg text-theme-text-primary">{title}</strong>
      <p className="mt-3 break-keep">{description}</p>
    </div>
  </div>
);

export default IntroInfoCard;

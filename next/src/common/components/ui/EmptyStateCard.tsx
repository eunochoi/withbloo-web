import Image from 'next/image';
import standingCat from '/public/img/bloolog/cats/cat-blue-standing.png';

interface Props {
  description: string;
  title: string;
}

const EmptyStateCard = ({ description, title }: Props) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 pt-10 text-center">
    <Image src={standingCat} alt="" className="mt-20 h-auto w-36 max-w-full shrink-0" sizes="144px" />
    <div className="flex flex-col gap-1.5">
      <h2 className="m-0 text-lg font-bold text-theme-text-primary">{title}</h2>
      <p className="m-0 break-keep text-sm leading-relaxed text-theme-text-secondary">{description}</p>
    </div>
  </div>
);

export default EmptyStateCard;

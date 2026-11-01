import DocCard from '@/common/components/ui/Doc/DocCard';

interface DocSubsection {
  closing?: string[];
  list: string[];
  title: string;
}

interface Props {
  closing?: string[];
  list?: string[];
  paragraphs?: string[];
  subsections?: DocSubsection[];
  title: string;
}

const paragraphClass = 'm-0 select-text';
const listClass = 'flex list-disc flex-col gap-2 pl-5';
const listItemClass = 'select-text pl-1';

const DocContent = ({ closing, list, paragraphs, subsections, title }: Props) => {
  return (
    <DocCard className="select-text px-5 py-8 tablet:px-8 tablet:py-10">
      <h2 className="m-0 text-2xl leading-tight text-theme-text-primary">{title}</h2>
      <div className="mt-4 flex flex-col gap-3 text-base leading-7 text-theme-text-secondary">
        {paragraphs?.map((paragraph) => (
          <p key={paragraph} className={paragraphClass}>{paragraph}</p>
        ))}
        {list ? (
          <ul className={listClass}>
            {list.map((item) => <li key={item} className={listItemClass}>{item}</li>)}
          </ul>
        ) : null}
        {closing?.map((paragraph) => (
          <p key={paragraph} className={paragraphClass}>{paragraph}</p>
        ))}
        {subsections?.map((subsection, index) => (
          <div key={`${subsection.title}-${index}`} className="mt-2 flex flex-col gap-2 py-2 pl-5">
            {subsection.title ? (
              <h3 className="break-keep text-lg font-bold text-theme-text-primary">{subsection.title}</h3>
            ) : null}
            <ul className={listClass}>
              {subsection.list.map((item) => <li key={item} className={listItemClass}>{item}</li>)}
            </ul>
            {subsection.closing?.map((paragraph) => (
              <p key={paragraph} className={paragraphClass}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </DocCard>
  );
};

export default DocContent;

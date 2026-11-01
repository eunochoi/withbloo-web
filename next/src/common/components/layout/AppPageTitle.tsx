import { AppPageContainer } from './AppPageContainer';

interface Props {
  title: string;
  hashtags: string;
}

const AppPageTitle = ({ title, hashtags }: Props) => (
  <header className="bg-theme-surface pb-1 pt-8">
    <AppPageContainer className="flex flex-col items-start gap-1">
      <p className="m-0 text-base font-semibold text-theme-accent-deep">{hashtags}</p>
      <h1 className="m-0 text-4xl font-bold leading-tight tracking-tight text-theme-text-primary">{title}</h1>
    </AppPageContainer>
  </header>
);

export default AppPageTitle;

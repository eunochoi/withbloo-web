import type { ComponentProps } from 'react';
import { ContentTopButton } from './ContentTopButton';

export function ContentBottomButton(props: ComponentProps<typeof ContentTopButton>) {
  return <div className="flex justify-center"><ContentTopButton {...props} /></div>;
}

import { Fragment, type ReactNode } from 'react';
import ToolbarButton from './ToolbarButton';

// Keep the icon and first condition readable; truncate only the remaining conditions.
const ToolbarSelectionButton = ({ icon, parts, accessibilityLabel, onClick, disabled = false }: {
  icon: ReactNode; parts: ReactNode[]; accessibilityLabel: string; onClick: () => void; disabled?: boolean;
}) => {
  const [first, ...remaining] = parts;
  return (
    <ToolbarButton onClick={onClick} disabled={disabled} aria-label={accessibilityLabel}>
      <span className="flex min-w-0 items-center">
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">{icon}<span>{first}</span></span>
        {remaining.length > 0 && <span className="min-w-0 truncate">{remaining.map((part, index) => <Fragment key={index}> · {part}</Fragment>)}</span>}
      </span>
    </ToolbarButton>
  );
};

export default ToolbarSelectionButton;

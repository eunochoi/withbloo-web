export const SheetHandle = ({ onClose, color }: { onClose: () => void; color?: string }) => (
  <button type="button" aria-label="닫기" onClick={onClose} className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
    <span style={color ? { backgroundColor: color } : undefined} className="h-1 w-8 rounded-full bg-theme-accent" />
  </button>
);

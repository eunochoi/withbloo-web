export const PICKER_CONTENT_CLASS = 'flex flex-col gap-8 relative w-full pb-[max(24px,env(safe-area-inset-bottom))]';
export const PICKER_TITLE_CLASS = 'text-center  text-xl font-semibold tracking-tight text-theme-text-primary';
export const PICKER_DESCRIPTION_CLASS = 'min-h-6 flex justify-center items-center text-base text-theme-text-secondary';
export const PICKER_BODY_CLASS = 'pb-3 w-full min-w-0';
export const PICKER_ACTIONS_CLASS = 'w-full';
const PICKER_BUTTON_BASE_CLASS = 'flex min-h-12 w-full items-center justify-center rounded-full px-5  text-base text-theme-text-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40';
export const PICKER_CONFIRM_BUTTON_CLASS = `${PICKER_BUTTON_BASE_CLASS} bg-theme-accent`;
export const PICKER_DANGER_BUTTON_CLASS = `${PICKER_BUTTON_BASE_CLASS} bg-theme-danger`;

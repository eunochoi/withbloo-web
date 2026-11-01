export type NoticeContent = { title: string; message?: string; tone?: "info" | "success" | "error" };
type NoticeListener = (notice: NoticeContent) => void;
const listeners = new Set<NoticeListener>();
export const showNotice = (notice: string | NoticeContent) => {
  const content = typeof notice === "string" ? { title: notice } : notice;
  listeners.forEach((listener) => listener(content));
};
export const subscribeNotice = (listener: NoticeListener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

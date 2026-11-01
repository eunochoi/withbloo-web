"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PiDownloadSimpleFill, PiShareNetworkFill, PiCaretRightBold, PiSpinnerGapBold } from "react-icons/pi";
import { authAction } from "@/common/auth/authAction";
import { AUTH_ERROR_CODE } from "@/common/auth/types";
import { PanelDialog } from "@/common/components/ui/Dialog/PanelDialog";
import InfoNotice from "@/common/components/ui/InfoNotice";
import { showNotice } from "@/common/components/ui/Notice/notice";

type SaveHandle = { createWritable: () => Promise<WritableStream<Uint8Array>> };
type BackupWindow = Window & { showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<SaveHandle> };
const inputClass = "min-h-12 w-full rounded-2xl border border-theme-border bg-theme-surface px-4 py-3 text-base text-theme-text-primary outline-none placeholder:text-theme-text-secondary focus:border-theme-accent disabled:opacity-50";
const buttonClass = "flex min-h-12 w-full items-center justify-center rounded-full border border-theme-accent-deep bg-theme-accent px-5 py-3 text-base font-semibold text-theme-text-on-accent active:opacity-65 disabled:opacity-40";

export function BackupDialog({ onClose, onBusyChange }: {
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const [step, setStep] = useState<"destination" | "password">("destination");
  const [destination, setDestination] = useState<"device" | "share">("device");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);
  const active = useRef(false);
  const title = step === "destination" ? "백업을 어디에 보관할까요?" : "백업하기";
  const request = (url: string, init: RequestInit) => authAction(async () => {
    const response = await fetch(url, init);
    return response.status === 401
      ? { ok: false as const, code: AUTH_ERROR_CODE.needLogin, message: "로그인이 필요해요. 다시 로그인한 뒤 진행해주세요." }
      : { ok: true as const, data: response };
  }, { redirectOnAuthError: false });
  const checkResponse = async (response: Response) => {
    if (response.ok) return;
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "작업을 완료하지 못했어요. 잠시 후 다시 시도해주세요.");
  };
  const finish = () => {
    setPassword("");
    setConfirmation("");
    setShareFile(null);
    onClose();
  };
  const run = async () => {
    if (active.current) return;
    if (!shareFile && password !== confirmation) { setError("비밀번호가 일치하지 않아요."); return; }
    if (password.length < 8 || new TextEncoder().encode(password).length > 1024) { setError("비밀번호는 8자 이상으로 입력해주세요."); return; }
    active.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    let saveHandle: SaveHandle | undefined;
    try {
      const filename = `withbloo-${new Date().toISOString().replace(/[:.]/g, "-")}.bloo`;
      if (shareFile) {
        await navigator.share({ title: "Google Drive 등으로 백업 공유", files: [shareFile] });
        finish();
        return;
      }
      const picker = (window as BackupWindow).showSaveFilePicker;
      if (destination === "device" && picker) saveHandle = await picker.call(window, { suggestedName: filename, types: [{ description: "'위블' 백업", accept: { "application/x-bloolog-backup": [".bloo"] } }] });
      const response = await request("/api/backup/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      await checkResponse(response);
      if (saveHandle && response.body) {
        const writable = await saveHandle.createWritable();
        await response.body.pipeTo(writable);
      } else {
        const blob = await response.blob();
        if (!blob.size) throw new Error("백업 파일을 저장하지 못했어요.");
        if (destination === "share") {
          const prepared = new File([blob], filename, { type: "application/x-bloolog-backup" });
          if (navigator.userActivation?.isActive) {
            await navigator.share({ title: "Google Drive 등으로 백업 공유", files: [prepared] });
            finish();
          } else {
            // Long preparation can outlive the browser's transient user activation.
            setShareFile(prepared);
          }
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
      showNotice({ title: "백업 저장 완료", message: "복원은 '위블' 앱에서만 가능해요.", tone: "success" });
      finish();
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      const message = reason instanceof Error ? reason.message : "작업을 완료하지 못했어요.";
      showNotice({ title: "백업하지 못했어요", message, tone: "error" });
      finish();
    } finally {
      active.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  };
  const shareSupported = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare?.({ files: [new File([""], "backup.bloo", { type: "application/x-bloolog-backup" })] });
  return (
    <AnimatePresence mode="wait" propagate>
      <PanelDialog key={step} ariaLabel={title} onClose={finish} dismissible={!busy} height="auto">
        <h2 id={`${id}-title`} className="shrink-0 px-[5%] py-1 text-center text-lg font-semibold tracking-tight text-theme-text-primary">{title}</h2>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-[5%] pt-6 pb-[max(1.75rem,calc(1.75rem+env(safe-area-inset-bottom)))]">
          {step === "destination" ? (
            <div className="flex flex-col gap-3">
              {([
                { value: "device", title: "기기에 저장하기", description: "원하는 폴더에 백업 파일을 저장해요.", Icon: PiDownloadSimpleFill },
                { value: "share", title: "Google Drive 등으로 공유하기", description: shareSupported ? "공유 화면에서 저장할 앱을 선택해요." : "이 브라우저에서는 파일 공유를 지원하지 않아요.", Icon: PiShareNetworkFill },
              ] as const).map(({ value, title: label, description, Icon }) => (
                <button key={value} type="button" disabled={value === "share" && !shareSupported} onClick={() => { setDestination(value); setStep("password"); }} className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border bg-transparent p-4 text-left active:opacity-70 disabled:opacity-40">
                  <Icon aria-hidden className="h-7 w-7 shrink-0 text-theme-accent" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-base font-semibold">{label}</span><span className="text-sm leading-relaxed text-theme-text-secondary">{description}</span></span>
                  <PiCaretRightBold aria-hidden className="h-5 w-5 shrink-0 text-theme-text-tertiary" />
                </button>
              ))}
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void run(); }}>
              <p className="break-keep text-sm leading-relaxed text-theme-text-secondary [text-wrap:pretty]">
                백업 파일을 보호할 비밀번호를 <span className="whitespace-nowrap">8자 이상</span> 입력해주세요.
              </p>
              <input aria-label="비밀번호" type="password" autoComplete="new-password" autoCapitalize="none" spellCheck={false} maxLength={256} placeholder="비밀번호" value={password} disabled={busy || !!shareFile} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
              <input aria-label="비밀번호 확인" type="password" autoComplete="new-password" autoCapitalize="none" spellCheck={false} maxLength={256} placeholder="비밀번호 확인" value={confirmation} disabled={busy || !!shareFile} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} />
              {error && <p role="alert" className="text-sm text-theme-danger">{error}</p>}
              {busy && <PiSpinnerGapBold role="status" aria-label="백업 작업 중…" className="mx-auto h-5 w-5 animate-spin text-theme-accent" />}
              {shareFile && <p role="status" className="text-sm text-theme-text-secondary">백업 준비가 끝났어요. 확인을 누르면 공유 화면이 열려요.</p>}
              <InfoNotice className="break-keep [text-wrap:pretty]">
                비밀번호를 잊으면 백업을 복원할 수 없어요. 복원은 &apos;위블&apos; 앱에서만 가능해요.
              </InfoNotice>
              <button type="submit" disabled={busy || !password} className={buttonClass}>확인</button>
            </form>
          )}
        </div>
      </PanelDialog>
    </AnimatePresence>
  );
}

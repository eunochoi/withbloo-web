"use client";

import { BackupDialog } from "@/common/components/features/Backup/BackupDialog";
import InfoNotice from "@/common/components/ui/InfoNotice";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PiSpinnerGapBold } from "react-icons/pi";
import { SettingSectionCard } from "./SettingSectionCard";

export function BackupSettingsSection() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <SettingSectionCard>
        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="py-2 text-xl font-semibold text-theme-text-primary">백업</h2>
          <div className="flex flex-col gap-3 px-1 pt-2">
            <div className="overflow-hidden rounded-2xl border border-theme-border/50 bg-theme-surface-muted">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(true)}
                className="flex min-h-16 w-full items-center gap-4 p-4 text-left transition-opacity disabled:opacity-40 active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-theme-accent"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-theme-text-primary">백업 파일 저장하기</span>
                  <span className="break-keep text-sm text-theme-text-secondary">기록·사진을 파일로 보관해요.</span>
                </span>
                {busy && <PiSpinnerGapBold aria-label="백업 작업 중…" className="h-5 w-5 shrink-0 animate-spin text-theme-accent" />}
              </button>
            </div>
            <InfoNotice className="break-keep [text-wrap:pretty]">최대 1GB의 .bloo 파일로 백업되며 &apos;위블&apos; 앱에서만 복원 가능해요.</InfoNotice>
          </div>
        </section>
      </SettingSectionCard>
      <AnimatePresence>
        {open && <BackupDialog onBusyChange={setBusy} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

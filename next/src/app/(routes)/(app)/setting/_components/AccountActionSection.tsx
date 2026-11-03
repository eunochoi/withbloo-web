"use client";

import { DeleteIcon, LogoutIcon } from '@/common/constants/appIcons';

import { logout } from "@/common/auth/logout";
import { ConfirmDialog } from "@/common/components/ui/Dialog/ConfirmDialog";
import { useState } from "react";

import { SettingItem } from "./SettingItem";
import { SettingSectionCard } from "./SettingSectionCard";
import { SettingSubsection } from "./SettingSubsection";

interface Props {
  onDeleteAccount: () => void;
}

export const AccountActionSection = ({ onDeleteAccount }: Props) => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <>
      <SettingSectionCard>
        <SettingSubsection title="계정 관리">
          <SettingItem
            settingItemKey="로그아웃"
            settingItemValue={
              <button onClick={() => setIsLogoutConfirmOpen(true)} type="button">
                <LogoutIcon className="text-xl" />
              </button>
            }
          />
          <SettingItem
            settingItemKey="회원 탈퇴"
            settingItemValue={
              <button onClick={onDeleteAccount} type="button">
                <DeleteIcon className="text-xl" />
              </button>
            }
          />
        </SettingSubsection>
      </SettingSectionCard>
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="로그아웃"
        confirmLabel="로그아웃"
        confirmDescription="현재 계정에서 로그아웃해요."
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
      />
    </>
  );
};

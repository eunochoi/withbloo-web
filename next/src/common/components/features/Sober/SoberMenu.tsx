'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authAction } from '@/common/auth/authAction';
import { deleteSober } from '@/common/actions/sober';
import { MoreIcon } from '@/common/constants/appIcons';
import Menus from '@/common/components/ui/Menus';

export default function SoberMenu({ id, name, onDetail, onEdit, onDeleted }: {
  id: number; name: string; onDetail?: () => void; onEdit: () => void; onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const query = useQueryClient();
  const remove = async () => {
    if (pending) return;
    setPending(true);
    try {
      await authAction(() => deleteSober(id));
      await query.invalidateQueries({ queryKey: ['sober'] });
    } catch (error) { throw error; } finally { setPending(false); }
  };
  return <>
    <button type="button" aria-label={`${name} 메뉴`} disabled={pending} onClick={() => setOpen(true)} className="-mr-5 flex h-11 w-11 shrink-0 items-center justify-center text-2xl text-theme-accent disabled:opacity-40"><MoreIcon /></button>
    <Menus kind="sober" title={name} isOpen={open} onClose={() => setOpen(false)} onDetail={onDetail} onEdit={onEdit} onDelete={remove} onDeleted={onDeleted} />
  </>;
}

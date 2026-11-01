import { type NextRequest } from "next/server";
import { exportBackupFile } from "@/common/backup/service";
import { readExportRequest, withBackupRequest } from "@/common/backup/http";
import { createBackupWorkspace, backupFileResponse } from "@/common/backup/files";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 900;
export async function POST(request: NextRequest) {
  return withBackupRequest(request, async (owner) => {
    const { password } = await readExportRequest(request);
    const workspace = await createBackupWorkspace();
    try {
      const { path } = await exportBackupFile(owner, password, owner.timezone, workspace.directory);
      return backupFileResponse(path, `withbloo-${new Date().toISOString().replace(/[:.]/g, "-")}.bloo`, workspace.dispose);
    } catch (error) { await workspace.dispose(); throw error; }
  });
}

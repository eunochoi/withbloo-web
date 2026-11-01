import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "../auth/getAuth";
import { getUserTimezone } from "../utils/date/userTimezone";
import { validateBackupPassword } from "./container";
import { BackupError } from "./types";
interface Context {
  userId: number;
  email: string;
  timezone: string;
}
const processState = globalThis as unknown as { backupUsers?: Set<number> };
const active = (processState.backupUsers ??= new Set<number>());
export async function withBackupRequest(
  request: NextRequest,
  action: (owner: Context) => Promise<Response>,
): Promise<Response> {
  let userId: number | undefined;
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host"))
      throw new BackupError("현재 사이트에서 다시 시도해주세요.", 403);
    const auth = await getAuth();
    if (!auth.ok)
      return NextResponse.json(
        { message: "로그인이 만료되었어요. 새로고침 후 다시 시도해주세요." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    if (active.has(auth.userId) || active.size >= 2)
      throw new BackupError(
        "백업 작업이 진행 중이에요. 잠시 후 다시 시도해주세요.",
        429,
      );
    active.add(auth.userId);
    userId = auth.userId;
    const response = await action({
      userId: auth.userId,
      email: auth.email,
      timezone: await getUserTimezone(),
    });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    if (!(error instanceof BackupError))
      console.error(
        "Backup operation failed:",
        error instanceof Error ? error.name : "unknown",
      );
    return NextResponse.json(
      {
        message:
          error instanceof BackupError
            ? error.message
            : "백업 작업을 완료하지 못했어요. 기존 기록은 그대로 유지됩니다.",
      },
      {
        status: error instanceof BackupError ? error.status : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } finally {
    if (userId !== undefined) active.delete(userId);
  }
}
async function readBody(request: NextRequest, limit: number) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length > limit)
    throw new BackupError(
      "백업 요청 크기 제한을 초과했어요.",
      413,
    );
  const reader = request.body?.getReader();
  if (!reader) throw new BackupError("요청 내용을 확인해주세요.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > limit) {
        await reader.cancel();
        throw new BackupError("파일 크기 제한을 초과했어요.", 413);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    reader.releaseLock();
  }
}
export async function readExportRequest(request: NextRequest) {
  let body;
  try {
    body = JSON.parse((await readBody(request, 4096)).toString("utf8"));
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError("백업 요청이 올바르지 않습니다.");
  }
  validateBackupPassword(body?.password);
  return { password: body.password as string };
}

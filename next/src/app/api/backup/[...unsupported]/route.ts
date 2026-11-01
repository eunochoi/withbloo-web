import { NextResponse } from "next/server";

// Retired API paths must not fall through to the app's HTML catch-all with HTTP 200.
export function GET() {
  return NextResponse.json(
    { message: "웹에서는 백업 저장만 지원해요. 복원은 '위블' 앱에서 진행해주세요." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export const POST = GET;

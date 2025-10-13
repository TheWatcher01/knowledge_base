import { NextResponse } from "next/server";

import { getRagStatus } from "@/lib/rag-health";

export async function GET() {
  const status = await getRagStatus();
  const response = {
    ...status,
    checkedAt: new Date().toISOString(),
  };
  return NextResponse.json(response, {
    status: status.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";

type TelemetryPayload = {
  url?: string;
  ts?: number;
};

export async function POST(request: Request) {
  let payload: TelemetryPayload | null = null;

  try {
    payload = (await request.json()) as TelemetryPayload;
  } catch {
    // Corps vide ou JSON invalide : on ignore simplement.
  }

  if (payload?.url && process.env.NODE_ENV !== "production") {
    console.info("[telemetry] RSC fetch abort", payload);
  }

  return new NextResponse(null, { status: 204 });
}

export function GET() {
  return NextResponse.json({ status: "ok" });
}

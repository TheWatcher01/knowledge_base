import { NextResponse } from "next/server";
import { enableRagMock, resetRagMockState, getRagMockSnapshot } from "@/lib/rag-mock";

export async function POST(request: Request) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not available" }, { status: 404 });
    }

    enableRagMock();

    try {
        const body = (await request.json()) as { failModels?: string[] };
        resetRagMockState({ failModels: body?.failModels });
    } catch {
        resetRagMockState();
    }

    return NextResponse.json({ ok: true, state: getRagMockSnapshot() });
}

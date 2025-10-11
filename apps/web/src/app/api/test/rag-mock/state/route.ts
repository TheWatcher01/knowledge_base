import { NextResponse } from "next/server";
import { getRagMockSnapshot, enableRagMock } from "@/lib/rag-mock";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not available" }, { status: 404 });
    }

    enableRagMock();
    return NextResponse.json(getRagMockSnapshot());
}

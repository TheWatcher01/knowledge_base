import { NextResponse } from "next/server";
import { owuiJson } from "@/lib/rag";

export async function GET() {
    try {
        const payload = await owuiJson("/api/v1/models?refresh=true");
        let models: unknown = [];

        if (Array.isArray(payload)) {
            models = payload;
        } else if (payload && typeof payload === "object") {
            const candidates =
                (payload as Record<string, unknown>).models ??
                (payload as Record<string, unknown>).data ??
                [];
            if (Array.isArray(candidates)) {
                models = candidates;
            }
        }

        return NextResponse.json({ models });
    } catch (error) {
        console.warn("[api/models] Failed to load models", error);
        return NextResponse.json(
            { error: "Failed to load models" },
            { status: 502 },
        );
    }
}

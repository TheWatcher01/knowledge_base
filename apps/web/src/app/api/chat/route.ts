import { NextRequest, NextResponse } from "next/server";
import { owuiJson } from "@/lib/owui";
import { OWUI_BASE, OWUI_TOKEN, collectionName } from "@/lib/config";

type RetrievedDoc = { text: string };
type RetrievalResponse = {
    docs?: RetrievedDoc[];
    documents?: unknown;
};

function collectDocumentTexts(payload: RetrievalResponse): string[] {
    const texts: string[] = [];

    if (Array.isArray(payload.docs)) {
        for (const doc of payload.docs) {
            if (doc && typeof doc.text === "string") {
                texts.push(doc.text);
            }
        }
    }

    const enqueue = (value: unknown) => {
        if (typeof value === "string") {
            texts.push(value);
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                enqueue(item);
            }
        }
    };

    if (payload.documents !== undefined) {
        enqueue(payload.documents);
    }

    return texts;
}

// Edge runtime
export const runtime = "edge";

// POST /api/chat
export async function POST(req: NextRequest) {
    let body: unknown;

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { kbId, model, question } = (body ?? {}) as {
        kbId?: string;
        model?: string;
        question?: string;
    };

    if (!kbId || !question) {
        return NextResponse.json({ error: "Missing kbId or question" }, { status: 400 });
    }

    let docs: RetrievedDoc[] = [];

    try {
        const response = (await owuiJson("/api/v1/retrieval/query/doc", {
            method: "POST",
            body: JSON.stringify({
                query: question,
                collection_name: collectionName(kbId),
                k: 5,
            }),
        })) as RetrievalResponse;

        const normalized = collectDocumentTexts(response);

        docs = normalized.map((text) => ({ text }));
    } catch (error) {
        console.warn("[api/chat] Retrieval failed", error);
        docs = [];
    }

    const ctx = docs
        .map((doc, index) => `Doc${index + 1}:\n${doc.text}`)
        .join("\n\n");

    const prompt = `Réponds de façon concise en citant Doc1..N.\n\n${ctx}\n\nQuestion:\n${question}`;

    try {
        const upstream = await fetch(`${OWUI_BASE}/api/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OWUI_TOKEN}`,
            },
            body: JSON.stringify({
                model,
                stream: true,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!upstream.ok || !upstream.body) {
            const message = await upstream.text();
            return NextResponse.json(
                { error: message || "Upstream chat error" },
                { status: upstream.status || 502 },
            );
        }

        return new Response(upstream.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("[api/chat] Upstream request failed", error);
        return NextResponse.json({ error: "Failed to reach chat service" }, { status: 502 });
    }
}

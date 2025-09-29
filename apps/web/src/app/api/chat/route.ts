import { NextRequest, NextResponse } from "next/server";
import { owuiJson } from "@/lib/owui";
import { OWUI_BASE, OWUI_TOKEN, collectionName } from "@/lib/config";

type RetrievedDoc = {
    text: string;
    metadata?: Record<string, unknown> | null;
};

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
                hybrid: true,
                k_reranker: 5,
                k: 5,
            }),
        })) as unknown;

        docs = extractDocs(response);
    } catch (error) {
        console.warn("[api/chat] Retrieval failed", error);
        docs = [];
    }

    const MAX_DOC_CHARS = 1_500;

    const docSummaries = docs.map((doc, index) => {
        const labels: string[] = [];
        if (doc.metadata && typeof doc.metadata === "object") {
            const { title, source, url, name } = doc.metadata as Record<string, unknown>;

            if (typeof title === "string" && title.trim().length > 0) {
                labels.push(title.trim());
            }

            const location =
                typeof source === "string" && source.trim().length > 0
                    ? source.trim()
                    : typeof url === "string" && url.trim().length > 0
                        ? url.trim()
                        : typeof name === "string" && name.trim().length > 0
                            ? name.trim()
                            : null;

            if (location) {
                labels.push(location);
            }
        }

        const descriptor = labels.length > 0 ? labels.join(" · ") : "(source non précisée)";

        return `- Doc${index + 1}: ${descriptor}`;
    });

    const ctx = docs
        .map((doc, index) => {
            const snippet = doc.text.length > MAX_DOC_CHARS
                ? `${doc.text.slice(0, MAX_DOC_CHARS)}…`
                : doc.text;

            return `Doc${index + 1}:\n${snippet}`;
        })
        .join("\n\n");

    const instructions = [
        "Consignes:",
        "- Réponds en Markdown structuré (titres, listes, tableaux si utile).",
        "- Utilise des blocs de code \u0060\u0060\u0060lang\u0060\u0060\u0060 pour les extraits techniques.",
        "- Appuie-toi uniquement sur les documents fournis et cite-les sous la forme [DocX].",
        "- Si les documents sont insuffisants ou absents, explique ce qui manque avant de proposer des pistes.",
    ];

    const knowledgeSection = ctx.length > 0
        ? `Références disponibles:\n${docSummaries.join("\n")}\n\nExtraits:\n\n${ctx}`
        : "Aucun document pertinent n'a été trouvé pour cette question.";

    const prompt = `${instructions.join("\n")}\n\n${knowledgeSection}\n\nQuestion:\n${question}`;

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
                    keep_alive: "20m",
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

function extractDocs(payload: unknown): RetrievedDoc[] {
    if (!payload || typeof payload !== "object") {
        return [];
    }

    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.docs)) {
        return (record.docs as unknown[])
            .filter((entry): entry is RetrievedDoc => {
                return Boolean(entry) && typeof entry === "object" && typeof (entry as { text?: unknown }).text === "string";
            })
            .map((entry) => entry as RetrievedDoc);
    }

    const documentsRaw = record.documents;
    const metadatasRaw = record.metadatas;

    const documents = Array.isArray(documentsRaw) ? (documentsRaw as unknown[][]) : [];
    const metadatas = Array.isArray(metadatasRaw) ? (metadatasRaw as unknown[][]) : [];

    const results: RetrievedDoc[] = [];

    documents.forEach((group, groupIndex) => {
        if (!Array.isArray(group)) return;

        group.forEach((text, docIndex) => {
            if (typeof text !== "string" || text.trim().length === 0) {
                return;
            }

            const metadataGroup = metadatas[groupIndex];
            const metadataCandidate = Array.isArray(metadataGroup) ? metadataGroup[docIndex] : undefined;
            const metadata =
                metadataCandidate && typeof metadataCandidate === "object"
                    ? (metadataCandidate as Record<string, unknown>)
                    : undefined;

            results.push({
                text,
                metadata,
            });
        });
    });

    return results;
}

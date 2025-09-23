import { NextRequest } from "next/server";
import { owuiJson } from "@/lib/owui";
import { OWUI_BASE, OWUI_TOKEN, collectionName } from "@/lib/config";

type RetrievedDoc = { text: string };

// Edge runtime
export const runtime = "edge";

// POST /api/chat
export async function POST(req: NextRequest) {
    const { kbId, model, question } = await req.json();

    // Retrieve relevant documents from the knowledge base
    const response = (await owuiJson("/retrieval/query/doc", {
        method: "POST",
        body: JSON.stringify({
            query: question,
            collection_name: collectionName(kbId),
            k: 5,
        }),
    })) as { docs?: RetrievedDoc[] };

    const docs = response.docs ?? [];
    const ctx = docs
        .map((doc, index) => `Doc${index + 1}:\n${doc.text}`)
        .join("\n\n");


    // Create the prompt
    const prompt = `Réponds de façon concise en citant Doc1..N.\n\n${ctx}\n\nQuestion:\n${question}`;

    // Call the Open Web UI chat completions endpoint with streaming
    const upstream = await fetch(`${OWUI_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OWUI_TOKEN}`,
        },
        body: JSON.stringify({
            model,
            stream: true,
            messages: [
                { role: "user", content: prompt }],
        }),

    });

    // Stream the response back to the client
    return new Response(upstream.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        },
    });
}

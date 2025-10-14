import { NextResponse } from "next/server";
import { ragApiJson } from "@/lib/rag";
import {
    getOpenRouterConfig,
    getOpenRouterFlagshipModels,
    getOpenRouterRerankModels,
} from "@/lib/openrouter";

export async function GET() {
    try {
        const chatModelsMap = new Map<string, Record<string, unknown>>();

        const registerChatModel = (entry: Record<string, unknown>) => {
            const id =
                typeof entry.id === "string" && entry.id.length > 0
                    ? entry.id
                    : typeof entry.name === "string" && entry.name.length > 0
                        ? entry.name
                        : undefined;
            if (!id) {
                return;
            }
            const meta = entry.meta && typeof entry.meta === "object" ? (entry.meta as Record<string, unknown>) : {};
            if (!meta.source) {
                meta.source = "ollama";
            }
            if (!meta.provider && meta.source === "ollama") {
                meta.provider = "Ollama";
            }
            chatModelsMap.set(id, { ...entry, id, meta });
        };

        const payload = await ragApiJson("/api/v1/models?refresh=true");
        if (Array.isArray(payload)) {
            for (const item of payload) {
                if (item && typeof item === "object") {
                    registerChatModel(item as Record<string, unknown>);
                }
            }
        } else if (payload && typeof payload === "object") {
            const candidates =
                (payload as Record<string, unknown>).models ??
                (payload as Record<string, unknown>).data ??
                [];
            if (Array.isArray(candidates)) {
                for (const item of candidates) {
                    if (item && typeof item === "object") {
                        registerChatModel(item as Record<string, unknown>);
                    }
                }
            }
        }

        const openRouter = getOpenRouterConfig();
        if (openRouter.enabled) {
            const flagship = getOpenRouterFlagshipModels();
            for (const model of flagship) {
                chatModelsMap.set(model.id, {
                    id: model.id,
                    label: model.label,
                    meta: {
                        provider: model.provider,
                        source: "openrouter",
                        description: model.description ?? null,
                    },
                });
            }
        }

        const chatModels = Array.from(chatModelsMap.values());
        const rerankModels =
            openRouter.enabled
                ? getOpenRouterRerankModels().map((model) => ({
                    id: model.id,
                    label: model.label,
                    meta: {
                        provider: model.provider,
                        source: "openrouter",
                        description: model.description ?? null,
                    },
                }))
                : [];

        return NextResponse.json({
            models: chatModels,
            chatModels,
            rerankModels,
        });
    } catch (error) {
        console.warn("[api/models] Failed to load models", error);
        return NextResponse.json(
            { error: "Failed to load models" },
            { status: 502 },
        );
    }
}

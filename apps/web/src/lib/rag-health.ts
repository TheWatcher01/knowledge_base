import { isRagMockEnabled, ragApiJson, RAG_SERVICE_DISABLED_MESSAGE } from "./rag";
import { RAG_API_BASE } from "./config";

export type RagStatusState = "mock" | "disabled" | "healthy" | "error";

export type RagStatus = {
  ok: boolean;
  state: RagStatusState;
  message?: string | null;
};

export async function getRagStatus(): Promise<RagStatus> {
  if (isRagMockEnabled()) {
    return {
      ok: true,
      state: "mock",
      message: null,
    };
  }

  if (!RAG_API_BASE) {
    return {
      ok: false,
      state: "disabled",
      message: RAG_SERVICE_DISABLED_MESSAGE,
    };
  }

  try {
    const payload = (await ragApiJson("/health", {
      method: "GET",
    })) as { status?: string } | null;

    const status = typeof payload?.status === "string" ? payload.status.toLowerCase() : "ok";
    if (status !== "ok") {
      return {
        ok: false,
        state: "error",
        message: `Health returned '${status}'`,
      };
    }

    return {
      ok: true,
      state: "healthy",
      message: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      state: "error",
      message,
    };
  }
}

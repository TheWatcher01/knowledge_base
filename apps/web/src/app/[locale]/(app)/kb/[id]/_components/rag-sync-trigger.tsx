"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LiveMessage } from "@/components/a11y/live-message";

const API_TIMEOUT_MS = 45_000;

type Status = "idle" | "pending" | "success" | "error";

type RagSyncResponse = {
  ok: boolean;
  collectionFound: boolean;
  reembeddedCount: number;
  errors: string[];
};

type RagSyncTriggerProps = {
  kbId: string;
};

export function RagSyncTrigger({ kbId }: RagSyncTriggerProps) {
  const t = useTranslations("kb.layout");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("pending");
    setMessage(t("ragSyncRunning"));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      const response = await fetch(`/api/kb/${kbId}/rag/reconcile`, {
        method: "POST",
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const payload = (await response.json().catch(() => null)) as RagSyncResponse | null;

      if (!response.ok || !payload) {
        const fallback = (payload?.errors?.[0] ?? response.statusText) || "unknown";
        handleError(fallback);
        return;
      }

      if (payload.collectionFound) {
        handleSuccess(t("ragSyncAlready"));
        return;
      }

      if (payload.reembeddedCount > 0) {
        handleSuccess(t("ragSyncReembedded", { count: payload.reembeddedCount }));
        return;
      }

      handleSuccess(t("ragSyncNoEntries"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      handleError(message);
    }
  }

  function handleSuccess(value: string) {
    setStatus("success");
    setMessage(value);
  }

  function handleError(reason: string) {
    setStatus("error");
    setMessage(t("ragSyncError", { error: normalizeError(reason) }));
  }

  function normalizeError(raw: string): string {
    if (!raw) {
      return t("ragSyncErrorFallback");
    }

    const simplified = raw.replace(/\s+/g, " ").trim();

    if (/Invalid JSON response/i.test(simplified)) {
      return t("ragSyncErrorUnexpectedResponse");
    }

    if (/aborted/i.test(simplified)) {
      return t("ragSyncErrorTimeout");
    }

    return simplified.slice(0, 160);
  }

  const tone = status === "error" ? "assertive" : "polite";
  const busy = status === "pending";

  return (
    <div className="flex flex-col items-end gap-2 text-right">
      <Button
        type="button"
        className="rounded-full px-5"
        onClick={handleClick}
        disabled={busy}
        aria-disabled={busy}
      >
        {busy ? t("ragSyncRunningButton") : t("ragSyncLabel")}
      </Button>
      {message ? (
        <LiveMessage tone={tone} className="text-xs text-muted-foreground">
          {message}
        </LiveMessage>
      ) : null}
    </div>
  );
}

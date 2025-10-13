"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { RagStatus } from "@/lib/rag-health";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  initialStatus: RagStatus & { checkedAt: string };
};

type BannerState = RagStatus & { checkedAt: string };

const REFRESH_INTERVAL_MS = 30_000;

export function RagStatusBanner({ initialStatus }: Props) {
  const t = useTranslations("kb.ragStatus");
  const [status, setStatus] = useState<BannerState>(initialStatus);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const shouldDisplay = !status.ok;

  const lastCheckedLabel = useMemo(() => {
    const timestamp = Date.parse(status.checkedAt);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return formatter.format(new Date(timestamp));
  }, [status.checkedAt]);

  const fetchStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/rag/status", {
        cache: "no-store",
      });
      const payload = (await response.json()) as BannerState;
      setStatus(payload);
    } catch (error) {
      setStatus({
        ok: false,
        state: "error",
        message: error instanceof Error ? error.message : String(error),
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    refreshTimer.current = setInterval(() => {
      void fetchStatus();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [fetchStatus]);

  if (!shouldDisplay) {
    return null;
  }

  const message =
    status.state === "disabled"
      ? t("disabled", { message: status.message ?? t("disabledDefault") })
      : t("error", { message: status.message ?? t("errorDefault") });

  return (
    <div
      className={cn(
        "border-b border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
      )}
      data-testid="rag-status-banner"
    >
      <div className="flex flex-col gap-1">
        <strong className="font-semibold">{t("title")}</strong>
        <span>{message}</span>
        {lastCheckedLabel ? (
          <span className="text-xs text-destructive/80">{t("checkedAt", { time: lastCheckedLabel })}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void fetchStatus();
          }}
          disabled={isRefreshing}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          {isRefreshing ? t("checking") : t("retry")}
        </Button>
      </div>
    </div>
  );
}

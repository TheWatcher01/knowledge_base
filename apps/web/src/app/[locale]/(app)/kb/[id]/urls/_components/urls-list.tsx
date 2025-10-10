"use client";

import { useEffect, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { LiveMessage } from "@/components/a11y/live-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RAG_SERVICE_DISABLED_MESSAGE } from "@/lib/rag";

const STATUSES = ["draft", "queued", "synced", "error"] as const;
type UrlStatus = (typeof STATUSES)[number];

type UrlListEntry = {
  id: string;
  title: string | null;
  url: string;
  description: string | null;
  status: UrlStatus;
  createdAt: string;
  updatedAt: string;
};

type UrlWithLabels = UrlListEntry & {
  createdDateLabel: string;
  createdTimeLabel: string;
  updatedDateLabel: string;
  updatedTimeLabel: string;
};

type UrlHistoryEntry = {
  id: string;
  status: UrlStatus | string;
  queuedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  updatedAt: string;
};

type UrlHistoryResponse = {
  document: {
    id: string;
    kbId: string;
    title: string | null;
    url: string;
    status: UrlStatus | string;
    updatedAt: string;
  };
  jobs: UrlHistoryEntry[];
};

export function UrlsList({ urls, canEdit }: { urls: UrlListEntry[]; canEdit: boolean }) {
  const formatter = useFormatter();
  const tPermissions = useTranslations("kb.permissions");

  const labeled = urls.map<UrlWithLabels>((entry) => {
    const createdDate = new Date(entry.createdAt);
    const updatedDate = new Date(entry.updatedAt);
    return {
      ...entry,
      createdDateLabel: formatter.dateTime(createdDate, { dateStyle: "medium" }),
      createdTimeLabel: formatter.dateTime(createdDate, { timeStyle: "short" }),
      updatedDateLabel: formatter.dateTime(updatedDate, { dateStyle: "medium" }),
      updatedTimeLabel: formatter.dateTime(updatedDate, { timeStyle: "short" }),
    };
  });

  return (
    <div className="space-y-3">
      {!canEdit ? <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p> : null}
      <ul className="space-y-3">
        {labeled.map((entry) => (
          <li
            key={entry.id}
            className="rounded-2xl border border-border/30 bg-card/80 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60"
          >
            <UrlRow url={entry} canEdit={canEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function UrlRow({ url, canEdit }: { url: UrlWithLabels; canEdit: boolean }) {
  const router = useRouter();
  const tUrls = useTranslations("kb.urls");
  const tForm = useTranslations("kb.urlForm");
  const tActions = useTranslations("kb.urlActions");
  const tStatuses = useTranslations("kb.urlStatuses");
  const tHistory = useTranslations("kb.urlHistory");
  const formatter = useFormatter();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(url.title ?? "");
  const [currentUrl, setCurrentUrl] = useState(url.url);
  const [description, setDescription] = useState(url.description ?? "");
  const [status, setStatus] = useState<UrlStatus>(url.status);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingestionMessage, setIngestionMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<UrlHistoryEntry[] | null>(null);
  const canResync = canEdit && !isEditing && url.status === "error";

  const titleFieldId = useId();
  const urlFieldId = useId();
  const descriptionFieldId = useId();
  const statusFieldId = useId();
  const errorMessageId = useId();
  const infoMessageId = useId();

  useEffect(() => {
    setTitle(url.title ?? "");
    setCurrentUrl(url.url);
    setDescription(url.description ?? "");
    setStatus(url.status);
    setIngestionMessage(null);
    setHistoryEntries(null);
    setHistoryError(null);
    setHistoryOpen(false);
  }, [url.id, url.title, url.url, url.description, url.status]);

  function resetForm() {
    setTitle(url.title ?? "");
    setCurrentUrl(url.url);
    setDescription(url.description ?? "");
    setStatus(url.status);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/urls/${url.id}/history`);
      const body = await response.text();

      if (!response.ok) {
        let message: string | undefined;
        try {
          const parsed = JSON.parse(body) as { error?: string } | null;
          if (parsed && typeof parsed.error === "string") {
            message = parsed.error;
          }
        } catch {
          // ignore parse errors
        }
        throw new Error(message ?? `${tHistory("loadError")} (${response.status})`);
      }

      let parsed: UrlHistoryResponse;
      try {
        parsed = JSON.parse(body) as UrlHistoryResponse;
      } catch {
        throw new Error(tHistory("loadError"));
      }

      setHistoryEntries(parsed.jobs ?? []);
    } catch (err) {
      setHistoryEntries([]);
      const message = err instanceof Error ? err.message : String(err);
      setHistoryError(message || tHistory("loadError"));
    } finally {
      setHistoryLoading(false);
    }
  }

  function openHistory() {
    setHistoryError(null);
    if ((historyEntries === null || historyError) && !historyLoading) {
      void loadHistory();
    }
    setHistoryOpen(true);
  }

  function handleHistoryOpenChange(open: boolean) {
    setHistoryOpen(open);
    if (open) {
      return;
    }

    if (!open) {
      setHistoryError(null);
    }
  }

  function formatTimestamp(value: string | null) {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return {
      date: formatter.dateTime(date, { dateStyle: "medium" }),
      time: formatter.dateTime(date, { timeStyle: "short" }),
    };
  }

  function resolveStatusLabel(value: UrlStatus | string) {
    if (STATUSES.includes(value as UrlStatus)) {
      return tStatuses(value as UrlStatus);
    }
    return value;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    setError(null);
    setIngestionMessage(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = currentUrl.trim();
    const trimmedDescription = description.trim();

    if (!trimmedUrl) {
      setError(tForm("urlRequired"));
      return;
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = ensureProtocol(trimmedUrl);
      new URL(normalizedUrl);
    } catch {
      setError(tForm("urlInvalid"));
      return;
    }

    const payload: Record<string, unknown> = {};
    if (trimmedTitle !== (url.title ?? "")) {
      payload.title = trimmedTitle;
    }
    if (normalizedUrl !== url.url) {
      payload.url = normalizedUrl;
    }
    if (trimmedDescription !== (url.description ?? "")) {
      payload.description = trimmedDescription;
    } else if (!trimmedDescription && (url.description ?? "") !== "") {
      payload.description = "";
    }
    if (status !== url.status) {
      payload.status = status;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      resetForm();
      return;
    }

    setBusy("save");

    const response = await fetch(`/api/urls/${url.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? tActions("updateError"));
      setBusy(null);
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      url?: { status?: string; ingestionError?: string };
    };

    if (data.url?.ingestionError) {
      if (data.url.ingestionError === RAG_SERVICE_DISABLED_MESSAGE) {
        setIngestionMessage(tForm("ingestionDisabled"));
      } else {
        setIngestionMessage(tForm("ingestionError", { error: data.url.ingestionError }));
      }
    } else if (data.url?.status === "queued") {
      setIngestionMessage(tForm("ingestionQueued"));
    } else {
      setIngestionMessage(null);
    }

    setBusy(null);
    setIsEditing(false);
    router.refresh();
  }

  async function handleResync() {
    if (!canEdit || busy) return;

    setBusy("save");
    setError(null);
    setIngestionMessage(null);

    const response = await fetch(`/api/urls/${url.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "queued" }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? tActions("updateError"));
      setBusy(null);
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      url?: { status?: string; ingestionError?: string };
    };

    if (data.url?.ingestionError) {
      if (data.url.ingestionError === RAG_SERVICE_DISABLED_MESSAGE) {
        setIngestionMessage(tForm("ingestionDisabled"));
      } else {
        setIngestionMessage(tForm("ingestionError", { error: data.url.ingestionError }));
      }
    } else if (data.url?.status === "queued") {
      setIngestionMessage(tForm("ingestionQueued"));
    } else {
      setIngestionMessage(null);
    }

    setBusy(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!canEdit || busy) return;

    const confirmed = window.confirm(
      tActions("deleteConfirm", { title: url.title ?? tUrls("untitled") }),
    );
    if (!confirmed) return;

    setBusy("delete");
    setError(null);

    const response = await fetch(`/api/urls/${url.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? tActions("deleteError"));
      setBusy(null);
      return;
    }

    setBusy(null);
    router.refresh();
  }

  const currentStatus = isEditing ? status : url.status;
  const urlAriaDescribedBy = [error ? errorMessageId : null, ingestionMessage ? infoMessageId : null]
    .filter((value): value is string => Boolean(value))
    .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">{url.title ?? tUrls("untitled")}</p>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {tUrls("entryDate", { date: url.createdDateLabel, time: url.createdTimeLabel })}
          </span>
        </div>
        <StatusBadge
          status={currentStatus}
          label={tStatuses(currentStatus)}
          onQueued={tActions("queuedTooltip")}
          onError={tActions("errorTooltip")}
        />
      </div>

      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={titleFieldId}>
              <span className="font-medium text-foreground">{tForm("titleLabel")}</span>
              <Input
                id={titleFieldId}
                placeholder={tForm("titlePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={!canEdit || busy === "save"}
                className="h-11 rounded-2xl border-border/40 bg-background"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={urlFieldId}>
              <span className="font-medium text-foreground">{tForm("urlLabel")}</span>
              <Input
                id={urlFieldId}
                value={currentUrl}
                onChange={(event) => {
                  setCurrentUrl(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                disabled={!canEdit || busy === "save"}
                required
                className="h-11 rounded-2xl border-border/40 bg-background"
                aria-invalid={!!error}
                aria-errormessage={error ? errorMessageId : undefined}
                aria-describedby={urlAriaDescribedBy}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={descriptionFieldId}>
            <span className="font-medium text-foreground">{tForm("descriptionLabel")}</span>
            <Textarea
              id={descriptionFieldId}
              className="min-h-[120px] rounded-2xl border-border/40 bg-background px-4 py-3 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canEdit || busy === "save"}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={statusFieldId}>
            <span className="font-medium text-foreground">{tForm("statusLabel")}</span>
            <select
              id={statusFieldId}
              className="w-full rounded-2xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={status}
              onChange={(event) => setStatus(event.target.value as UrlStatus)}
              disabled={!canEdit || busy === "save"}
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {tStatuses(item)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              size="sm"
              className="rounded-full px-4"
              disabled={!canEdit || busy === "save"}
            >
              {busy === "save" ? tActions("saving") : tActions("save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => {
                setIsEditing(false);
                resetForm();
                setError(null);
                setIngestionMessage(null);
              }}
              disabled={busy === "save"}
            >
              {tActions("cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-full px-4">
              <a href={url.url} target="_blank" rel="noreferrer">
                {tActions("open")}
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              {tUrls("lastUpdated", { date: url.updatedDateLabel, time: url.updatedTimeLabel })}
            </span>
          </div>
          {url.description ? (
            <p className="text-sm text-foreground">{url.description}</p>
          ) : (
            <p className="text-xs italic text-muted-foreground">{tUrls("missingDescription")}</p>
          )}
        </div>
      )}

      {ingestionMessage ? (
        <LiveMessage
          id={infoMessageId}
          className="block text-xs text-muted-foreground"
        >
          {ingestionMessage}
        </LiveMessage>
      ) : null}

      {!isEditing ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            onClick={openHistory}
            disabled={busy !== null}
          >
            {tActions("history")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            onClick={() => {
              if (!canEdit) {
                return;
              }
              setIsEditing(true);
              setError(null);
            }}
            disabled={!canEdit || busy !== null}
          >
            {tActions("edit")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="rounded-full px-4"
            onClick={handleDelete}
            disabled={!canEdit || busy !== null}
          >
            {busy === "delete" ? tActions("deleting") : tActions("delete")}
          </Button>
          {canResync ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={handleResync}
              disabled={!canEdit || busy !== null}
            >
              {busy === "save" ? tActions("saving") : tActions("resync")}
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={historyOpen} onOpenChange={handleHistoryOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{tHistory("title")}</DialogTitle>
            <DialogDescription>{tHistory("description", { url: url.url })}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {historyLoading ? (
              <p className="text-sm text-muted-foreground">{tHistory("loading")}</p>
            ) : historyError ? (
              <p className="text-sm text-red-500">{historyError}</p>
            ) : historyEntries && historyEntries.length > 0 ? (
              <ul className="space-y-3">
                {historyEntries.map((entry) => {
                  const queued = formatTimestamp(entry.queuedAt);
                  const started = formatTimestamp(entry.startedAt);
                  const finished = formatTimestamp(entry.finishedAt);
                  const updated = formatTimestamp(entry.updatedAt);

                  return (
                    <li key={entry.id} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">{resolveStatusLabel(entry.status)}</span>
                        {updated ? (
                          <span className="text-[11px] text-muted-foreground">
                            {tHistory("updatedAt", { date: updated.date, time: updated.time })}
                          </span>
                        ) : null}
                      </div>
                      <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {queued ? <div>{tHistory("queuedAt", { date: queued.date, time: queued.time })}</div> : null}
                        {started ? <div>{tHistory("startedAt", { date: started.date, time: started.time })}</div> : null}
                        {finished ? <div>{tHistory("finishedAt", { date: finished.date, time: finished.time })}</div> : null}
                      </dl>
                      {entry.errorMessage ? (
                        <p className="mt-3 text-xs text-red-500">
                          {tHistory("error", { error: entry.errorMessage })}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{tHistory("empty")}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                {tActions("close")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <LiveMessage
          id={errorMessageId}
          tone="assertive"
          className="block text-xs text-red-500"
        >
          {error}
        </LiveMessage>
      ) : null}
    </div>
  );
}

function StatusBadge({
  status,
  label,
  onQueued,
  onError,
}: {
  status: UrlStatus;
  label: string;
  onQueued: string;
  onError: string;
}) {
  const palette: Record<UrlStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    queued: "bg-amber-100 text-amber-900",
    synced: "bg-emerald-100 text-emerald-900",
    error: "bg-red-100 text-red-700",
  };

  const tooltip: Record<UrlStatus, string> = {
    draft: "",
    queued: onQueued,
    synced: "",
    error: onError,
  };

  return (
    <span
      title={tooltip[status]}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${palette[status]}`}
    >
      {label}
    </span>
  );
}

function ensureProtocol(input: string) {
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

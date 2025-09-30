"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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

export function UrlsList({ urls, canEdit }: { urls: UrlListEntry[]; canEdit: boolean }) {
  const formatter = useFormatter();
  const tPermissions = useTranslations("kb.permissions");
  const labeled = urls.map<UrlWithLabels>((entry) => {
    const createdDate = new Date(entry.createdAt);
    const updatedDate = new Date(entry.updatedAt);
    const createdDateLabel = formatter.dateTime(createdDate, { dateStyle: "medium" });
    const createdTimeLabel = formatter.dateTime(createdDate, { timeStyle: "short" });
    const updatedDateLabel = formatter.dateTime(updatedDate, { dateStyle: "medium" });
    const updatedTimeLabel = formatter.dateTime(updatedDate, { timeStyle: "short" });

    return {
      ...entry,
      createdDateLabel,
      createdTimeLabel,
      updatedDateLabel,
      updatedTimeLabel,
    };
  });

  return (
    <div className="space-y-3">
      {!canEdit && <p className="text-sm text-[var(--kb-text-muted)]">{tPermissions("viewOnlyMessage")}</p>}
      <ul className="space-y-3">
        {labeled.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-5 py-4 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]"
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

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(url.title ?? "");
  const [currentUrl, setCurrentUrl] = useState(url.url);
  const [description, setDescription] = useState(url.description ?? "");
  const [status, setStatus] = useState<UrlStatus>(url.status);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ingestionMessage, setIngestionMessage] = useState<string | null>(null);
  const canResync = canEdit && !isEditing && url.status === "error";

  useEffect(() => {
    setTitle(url.title ?? "");
    setCurrentUrl(url.url);
    setDescription(url.description ?? "");
    setStatus(url.status);
    setIngestionMessage(null);
  }, [url.id, url.title, url.url, url.description, url.status]);

  function resetForm() {
    setTitle(url.title ?? "");
    setCurrentUrl(url.url);
    setDescription(url.description ?? "");
    setStatus(url.status);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      return;
    }
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
      if (data.url.ingestionError === "Open WebUI integration is disabled.") {
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
    if (!canEdit) return;
    if (busy) return;

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
      if (data.url.ingestionError === "Open WebUI integration is disabled.") {
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
    if (!canEdit) {
      return;
    }
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      tActions("deleteConfirm", { title: url.title ?? tUrls("untitled") }),
    );
    if (!confirmed) {
      return;
    }

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[var(--kb-text)]">{url.title ?? tUrls("untitled")}</p>
          <p className="text-xs uppercase tracking-wide text-[var(--kb-text-muted)]">
            {tUrls("entryDate", { date: url.createdDateLabel, time: url.createdTimeLabel })}
          </p>
        </div>
        <StatusBadge status={isEditing ? status : url.status} label={tStatuses(isEditing ? status : url.status)} onQueued={tActions("queuedTooltip")} onError={tActions("errorTooltip")} />
      </div>

      {isEditing ? (
        <form className="space-y-3" onSubmit={handleSave}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
              <span className="font-medium text-[var(--kb-text)]">{tForm("titleLabel")}</span>
              <input
                className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
                placeholder={tForm("titlePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={!canEdit || busy === "save"}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
              <span className="font-medium text-[var(--kb-text)]">{tForm("urlLabel")}</span>
              <input
                className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
                value={currentUrl}
                onChange={(event) => setCurrentUrl(event.target.value)}
                disabled={!canEdit || busy === "save"}
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
            <span className="font-medium text-[var(--kb-text)]">{tForm("descriptionLabel")}</span>
          <textarea
            className="min-h-[90px] rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!canEdit || busy === "save"}
          />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
            <span className="font-medium text-[var(--kb-text)]">{tForm("statusLabel")}</span>
            <select
              className="w-full rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
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
            <button
              type="submit"
              className="rounded bg-[var(--kb-highlight)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              disabled={!canEdit || busy === "save"}
            >
              {busy === "save" ? tActions("saving") : tActions("save")}
            </button>
            <button
              type="button"
              className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
              onClick={() => {
                setIsEditing(false);
                resetForm();
                setError(null);
                setIngestionMessage(null);
              }}
              disabled={busy === "save"}
            >
              {tActions("cancel")}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-sm text-[var(--kb-text-subtle)]">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={url.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--kb-accent)] underline underline-offset-4 hover:text-[var(--kb-accent-strong)]"
            >
              {tActions("open")}
            </a>
            <span className="text-xs text-[var(--kb-text-muted)]">
              {tUrls("lastUpdated", { date: url.updatedDateLabel, time: url.updatedTimeLabel })}
            </span>
          </div>
          {url.description ? (
            <p className="text-sm text-[var(--kb-text)]">{url.description}</p>
          ) : (
            <p className="text-xs italic text-[var(--kb-text-muted)]">{tUrls("missingDescription")}</p>
          )}
        </div>
      )}

      {ingestionMessage && (
        <p className="text-xs text-[var(--kb-text-muted)]">{ingestionMessage}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!isEditing ? (
          <>
            <button
              type="button"
              className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
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
            </button>
            <button
              type="button"
              className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500"
              onClick={handleDelete}
              disabled={!canEdit || busy !== null}
            >
              {busy === "delete" ? tActions("deleting") : tActions("delete")}
            </button>
            {canResync && (
              <button
                type="button"
                className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
                onClick={handleResync}
                disabled={!canEdit || busy !== null}
              >
                {busy === "save" ? tActions("saving") : tActions("resync")}
              </button>
            )}
          </>
        ) : null}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
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
    draft: "bg-slate-200 text-slate-800",
    queued: "bg-amber-100 text-amber-800",
    synced: "bg-emerald-100 text-emerald-800",
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

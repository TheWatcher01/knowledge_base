"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const STATUSES = ["draft", "queued", "synced", "error"] as const;
type UrlStatus = (typeof STATUSES)[number];

type CreateUrlFormProps = {
  kbId: string;
};

export function CreateUrlForm({ kbId }: CreateUrlFormProps) {
  const router = useRouter();
  const tForm = useTranslations("kb.urlForm");
  const tStatuses = useTranslations("kb.urlStatuses");
  const tUrls = useTranslations("kb.urls");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<UrlStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInfo(null);

    const trimmedUrl = url.trim();
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

    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      kbId,
      url: normalizedUrl,
    };

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 0) {
      payload.title = trimmedTitle;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 0) {
      payload.description = trimmedDescription;
    }

    if (status !== "draft") {
      payload.status = status;
    }

    const response = await fetch("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? tForm("genericError"));
      setSubmitting(false);
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      url?: { status?: string; ingestionError?: string };
    };

    if (data.url?.ingestionError) {
      if (data.url.ingestionError === "Open WebUI integration is disabled.") {
        setInfo(tForm("ingestionDisabled"));
      } else {
        setInfo(tForm("ingestionError", { error: data.url.ingestionError }));
      }
    } else if (data.url?.status === "queued") {
      setInfo(tForm("ingestionQueued"));
    } else {
      setInfo(null);
    }

    setTitle("");
    setUrl("");
    setDescription("");
    setStatus("draft");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-base font-medium text-[var(--kb-text)]">{tUrls("ctaTitle")}</h3>
          <p className="text-sm text-[var(--kb-text-muted)]">{tUrls("ctaDescription")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
            <span className="font-medium text-[var(--kb-text)]">{tForm("titleLabel")}</span>
            <input
              className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
              placeholder={tForm("titlePlaceholder")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={submitting}
            />
            <span className="text-xs text-[var(--kb-text-muted)]">{tForm("titleHint")}</span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
            <span className="font-medium text-[var(--kb-text)]">{tForm("urlLabel")}</span>
          <input
              className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
              placeholder={tForm("urlPlaceholder")}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={submitting}
            />
            <span className="text-xs text-[var(--kb-text-muted)]">{tForm("urlHint")}</span>
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
          <span className="font-medium text-[var(--kb-text)]">{tForm("descriptionLabel")}</span>
          <textarea
            className="min-h-[90px] rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
            placeholder={tForm("descriptionPlaceholder")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={submitting}
          />
          <span className="text-xs text-[var(--kb-text-muted)]">{tForm("descriptionHint")}</span>
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
            <span className="font-medium text-[var(--kb-text)]">{tForm("statusLabel")}</span>
            <select
              className="w-[200px] rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
              value={status}
              onChange={(event) => setStatus(event.target.value as UrlStatus)}
              disabled={submitting}
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {tStatuses(item)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded bg-[var(--kb-highlight)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? tForm("submitting") : tForm("submit")}
          </button>

          {error && <span className="text-sm text-red-600">{error}</span>}
          {info && <span className="text-xs text-[var(--kb-text-muted)]">{info}</span>}

        </div>
      </form>
    </section>
  );
}

function ensureProtocol(input: string) {
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

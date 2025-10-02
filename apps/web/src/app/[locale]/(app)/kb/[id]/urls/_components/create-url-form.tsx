"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = ["draft", "queued", "synced", "error"] as const;
type UrlStatus = (typeof STATUSES)[number];

type CreateUrlFormProps = {
  kbId: string;
  canEdit: boolean;
};

export function CreateUrlForm({ kbId, canEdit }: CreateUrlFormProps) {
  const router = useRouter();
  const tForm = useTranslations("kb.urlForm");
  const tStatuses = useTranslations("kb.urlStatuses");
  const tUrls = useTranslations("kb.urls");
  const tPermissions = useTranslations("kb.permissions");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<UrlStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || submitting) {
      return;
    }

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{tForm("titleLabel")}</span>
          <Input
            placeholder={tForm("titlePlaceholder")}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={submitting || !canEdit}
            className="h-11 rounded-2xl border-border/40 bg-background"
          />
          <span className="text-xs text-muted-foreground/80">{tForm("titleHint")}</span>
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{tForm("urlLabel")}</span>
          <Input
            placeholder={tForm("urlPlaceholder")}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={submitting || !canEdit}
            className="h-11 rounded-2xl border-border/40 bg-background"
          />
          <span className="text-xs text-muted-foreground/80">{tForm("urlHint")}</span>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{tForm("descriptionLabel")}</span>
        <Textarea
          className="min-h-[120px] rounded-2xl border-border/40 bg-background px-4 py-3 text-sm"
          placeholder={tForm("descriptionPlaceholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting || !canEdit}
        />
        <span className="text-xs text-muted-foreground/80">{tForm("descriptionHint")}</span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{tForm("statusLabel")}</span>
          <select
            className="w-[200px] rounded-2xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            value={status}
            onChange={(event) => setStatus(event.target.value as UrlStatus)}
            disabled={submitting || !canEdit}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {tStatuses(item)}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" disabled={submitting || !canEdit} className="rounded-full px-6">
          {submitting ? tForm("submitting") : tForm("submit")}
        </Button>

        {error ? <span className="text-sm text-red-500">{error}</span> : null}
        {info ? <span className="text-xs text-muted-foreground">{info}</span> : null}
      </div>

      {!canEdit ? <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p> : null}
    </form>
  );
}

function ensureProtocol(input: string) {
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

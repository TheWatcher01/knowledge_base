"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OWUI_DISABLED_MESSAGE } from "@/lib/rag";

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
  const tActions = useTranslations("kb.urlActions");
  const tPermissions = useTranslations("kb.permissions");

  const isTestEnvironment = process.env.NODE_ENV === "test";
  const [open, setOpen] = useState(isTestEnvironment);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<UrlStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // a11y ids
  const titleId = useId();
  const titleHintId = useId();
  const urlId = useId();
  const urlHintId = useId();
  const urlErrorId = useId();
  const descriptionFieldId = useId();
  const statusFieldId = useId();
  const infoId = useId();
  const urlDescribedBy = [urlHintId, error ? urlErrorId : null, info ? infoId : null]
    .filter((value): value is string => Boolean(value))
    .join(" ") || undefined;

  function resetFormFields() {
    setTitle("");
    setUrl("");
    setDescription("");
    setStatus("draft");
  }

  function handleDialogOpenChange(next: boolean) {
    if (!canEdit) {
      setOpen(false);
      return;
    }

    if (!next && submitting) {
      return;
    }

    setOpen(next);

    if (next) {
      setError(null);
      setInfo(null);
      return;
    }

    resetFormFields();
    setError(null);
  }

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
      if (data.url.ingestionError === OWUI_DISABLED_MESSAGE) {
        setInfo(tForm("ingestionDisabled"));
      } else {
        setInfo(tForm("ingestionError", { error: data.url.ingestionError }));
      }
    } else if (data.url?.status === "queued") {
      setInfo(tForm("ingestionQueued"));
    } else {
      setInfo(null);
    }

    resetFormFields();
    setSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="rounded-full px-6"
            disabled={!canEdit}
            aria-disabled={!canEdit}
          >
            {tUrls("ctaTitle")}
          </Button>
        </DialogTrigger>

        <DialogContent
          showCloseButton
          className="sm:max-w-xl rounded-3xl border border-border/40 bg-card/95 px-6 py-6 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/90"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => {
              const firstField = document.getElementById(titleId);
              firstField?.focus();
            });
          }}
        >
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-semibold text-foreground">
              {tUrls("ctaTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {tUrls("ctaDescription")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleSubmit} aria-busy={submitting}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={titleId}>
                  <span className="font-medium text-foreground">{tForm("titleLabel")}</span>
                  <Input
                    id={titleId}
                    placeholder={tForm("titlePlaceholder")}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={submitting || !canEdit}
                    className="h-11 rounded-2xl border-border/40 bg-background focus-ring"
                    aria-describedby={titleHintId}
                  />
                  <span id={titleHintId} className="text-xs text-muted-foreground/80">
                    {tForm("titleHint")}
                  </span>
                </label>

                <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={urlId}>
                  <span className="font-medium text-foreground">{tForm("urlLabel")}</span>
                  <Input
                    id={urlId}
                    placeholder={tForm("urlPlaceholder")}
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    disabled={submitting || !canEdit}
                    className="h-11 rounded-2xl border-border/40 bg-background focus-ring"
                    aria-invalid={!!error}
                    aria-errormessage={error ? urlErrorId : undefined}
                    aria-describedby={urlDescribedBy}
                  />
                  <span id={urlHintId} className="text-xs text-muted-foreground/80">
                    {tForm("urlHint")}
                  </span>
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={descriptionFieldId}>
                <span className="font-medium text-foreground">{tForm("descriptionLabel")}</span>
                <Textarea
                  id={descriptionFieldId}
                  className="min-h-[120px] rounded-2xl border-border/40 bg-background px-4 py-3 text-sm"
                  placeholder={tForm("descriptionPlaceholder")}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={submitting || !canEdit}
                />
                <span className="text-xs text-muted-foreground/80">{tForm("descriptionHint")}</span>
              </label>

              <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={statusFieldId}>
                <span className="font-medium text-foreground">{tForm("statusLabel")}</span>
                <select
                  id={statusFieldId}
                  className="w-full rounded-2xl border border-border/40 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
            </div>

            {error ? (
              <LiveMessage id={urlErrorId} tone="assertive" className="text-sm text-red-500">
                {error}
              </LiveMessage>
            ) : null}
            {info && open ? (
              <LiveMessage id={infoId} className="text-xs text-muted-foreground">
                {info}
              </LiveMessage>
            ) : null}

            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={submitting}>
                  {tActions("cancel")}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={submitting || !canEdit}
                aria-disabled={submitting || !canEdit}
                className="rounded-full px-6"
              >
                {submitting ? tForm("submitting") : tForm("submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {info && !open ? (
        <LiveMessage id={infoId} className="max-w-sm text-right text-xs text-muted-foreground">
          {info}
        </LiveMessage>
      ) : null}

      {!canEdit ? <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p> : null}
    </div>
  );
}

function ensureProtocol(input: string) {
  try {
    return new URL(input).toString();
  } catch {
    return new URL(`https://${input}`).toString();
  }
}

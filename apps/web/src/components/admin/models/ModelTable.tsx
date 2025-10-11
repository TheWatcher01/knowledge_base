"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listModels,
  pullModel,
  deleteModel,
  getModelDefaults,
  setModelDefaults,
  listModelJobs,
  type ModelDefaults,
  type ModelJob,
  type OllamaModelSummary,
} from "@/lib/models";
import { toast } from "sonner";

type Props = {
  initialModels: OllamaModelSummary[];
  initialDefaults: ModelDefaults;
  initialError?: string;
};

export default function ModelTable({ initialModels, initialDefaults, initialError }: Props) {
  const t = useTranslations("admin.models");
  const tTable = useTranslations("admin.models.table");
  const tJobs = useTranslations("admin.models.jobs");

  const [models, setModels] = useState<OllamaModelSummary[]>(initialModels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [installing, setInstalling] = useState(false);
  const [defaults, setDefaults] = useState<ModelDefaults>(initialDefaults);
  const [updatingDefaults, setUpdatingDefaults] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ModelJob[]>([]);
  const [jobsRefreshing, setJobsRefreshing] = useState(false);
  const jobsRef = useRef<ModelJob[]>([]);
  const notifiedJobs = useRef<Set<string>>(new Set());

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    let cancelled = false;
    const loadJobs = async () => {
      try {
        const jobList = await listModelJobs();
        if (cancelled) {
          return;
        }
        setJobs(jobList);
        jobsRef.current = jobList;
        notifiedJobs.current = new Set(
          jobList
            .filter((job) => job.status === "succeeded" || job.status === "failed")
            .map((job) => job.id),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(t("refreshError", { error: message }));
      }
    };

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await listModels();
      setModels(next);
      const defaultsResponse = await getModelDefaults();
      setDefaults(defaultsResponse);
      setError(null);
      setActionError(null);
      const jobList = await listModelJobs();
      setJobs(jobList);
      jobsRef.current = jobList;
      notifiedJobs.current = new Set(
        jobList
          .filter((job) => job.status === "succeeded" || job.status === "failed")
          .map((job) => job.id),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(t("refreshError", { error: message }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const pollJobs = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setJobsRefreshing(true);
      }

      try {
        const nextJobs = await listModelJobs();
        const previousMap = new Map(jobsRef.current.map((job) => [job.id, job]));

        const completed: ModelJob[] = [];
        const failed: ModelJob[] = [];

        for (const job of nextJobs) {
          const previousStatus = previousMap.get(job.id)?.status;
          if (job.status === "succeeded" && previousStatus !== "succeeded") {
            completed.push(job);
          }
          if (job.status === "failed" && previousStatus !== "failed") {
            failed.push(job);
          }
        }

        setJobs(nextJobs);
        jobsRef.current = nextJobs;

        if (completed.length > 0) {
          for (const job of completed) {
            if (!notifiedJobs.current.has(job.id)) {
              notifiedJobs.current.add(job.id);
              toast.success(t("installSuccess", { name: job.model }));
              if (job.summary) {
                toast(t("installSummary", { summary: job.summary }));
              }
            }
          }
          await refresh();
        }

        if (failed.length > 0) {
          const lastFailure = failed[0];
          setActionError(lastFailure.error ?? t("installUnknownError"));
          for (const job of failed) {
            if (!notifiedJobs.current.has(job.id)) {
              notifiedJobs.current.add(job.id);
              toast.error(
                t("installError", {
                  error: job.error ?? t("installUnknownError"),
                }),
              );
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!silent) {
          toast.error(t("refreshError", { error: message }));
        }
      } finally {
        if (!silent) {
          setJobsRefreshing(false);
        }
      }
    },
    [refresh, t],
  );

  const statusBadgeClasses: Record<ModelJob["status"], string> = {
    queued: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    running: "border-primary/40 bg-primary/10 text-primary",
    succeeded: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    failed: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  const renderStatusIndicator = (status: ModelJob["status"]) => {
    const base = "inline-flex h-2.5 w-2.5 shrink-0 rounded-full";
    switch (status) {
      case "queued":
        return <span className={`${base} bg-amber-500/70`} aria-hidden />;
      case "running":
        return (
          <span
            className={`${base} border-2 border-primary/40 border-t-transparent animate-spin`}
            aria-hidden
          />
        );
      case "succeeded":
        return <span className={`${base} bg-emerald-500/70`} aria-hidden />;
      case "failed":
        return <span className={`${base} bg-destructive/80`} aria-hidden />;
    }
  };

  const jobStatusLabel = useCallback(
    (status: ModelJob["status"]) => tJobs(`status.${status}`),
    [tJobs],
  );

  const formatTime = useCallback(
    (value: string | null): string => {
      if (!value) {
        return tJobs("unknownTime");
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return tJobs("unknownTime");
      }
      try {
        return new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch {
        return date.toLocaleTimeString();
      }
    },
    [tJobs],
  );

  const jobTimelineText = useCallback(
    (job: ModelJob) => {
      switch (job.status) {
        case "queued":
          return tJobs("queuedAt", { time: formatTime(job.queued_at) });
        case "running":
          return tJobs("updatedAt", { time: formatTime(job.updated_at) });
        case "succeeded":
          return tJobs("finishedAt", { time: formatTime(job.finished_at) });
        case "failed":
          return tJobs("failedAt", { time: formatTime(job.finished_at ?? job.updated_at) });
      }
      return tJobs("unknownTime");
    },
    [formatTime, tJobs],
  );

  const jobDetailText = useCallback(
    (job: ModelJob) => {
      if (job.status === "failed") {
        return tJobs("error", { error: job.error ?? tJobs("unknownError") });
      }
      if (job.summary) {
        return tJobs("summary", { summary: job.summary });
      }
      return tJobs("noSummary");
    },
    [tJobs],
  );

  const activeJobs = jobs.filter((job) => job.status === "queued" || job.status === "running");
  const recentJobs = jobs
    .filter((job) => job.status === "succeeded" || job.status === "failed")
    .slice(0, 5);

  const handleInstall = useCallback(async () => {
    const modelName = window.prompt(t("installPrompt"));
    if (!modelName) {
      return;
    }

    const trimmed = modelName.trim();
    if (!trimmed) {
      return;
    }

    setInstalling(true);
    try {
      const job = await pullModel(trimmed);
      toast.success(t("installQueued", { name: trimmed }));
      setActionError(null);
      setJobs((previous) => {
        const filtered = previous.filter((item) => item.id !== job.id);
        const next = [job, ...filtered];
        jobsRef.current = next;
        return next;
      });
      notifiedJobs.current.delete(job.id);
      void pollJobs({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(t("installError", { error: message }));
      setActionError(message);
    } finally {
      setInstalling(false);
    }
  }, [pollJobs, t]);

  const handleDelete = useCallback(
    async (name: string) => {
      if (!window.confirm(t("deleteConfirm", { name }))) {
        return;
      }

      setLoading(true);
      try {
        await deleteModel(name);
        toast.success(t("deleteSuccess", { name }));
        setActionError(null);
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(t("deleteError", { error: message }));
        setActionError(message);
      } finally {
        setLoading(false);
      }
    },
    [refresh, t],
  );

  const updateDefaults = useCallback(
    async (nextDefaults: { chat_model?: string; embedding_model?: string }) => {
      setUpdatingDefaults(true);
      try {
        const payload = await setModelDefaults(nextDefaults);
        setDefaults(payload);
        toast.success(t("defaultsSuccess"));
        setActionError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(t("defaultsError", { error: message }));
        setActionError(message);
      } finally {
        setUpdatingDefaults(false);
      }
    },
    [t],
  );

  useEffect(() => {
    const hasActiveJobs = jobs.some((job) => job.status === "queued" || job.status === "running");
    if (!hasActiveJobs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void pollJobs({ silent: true });
    }, 4000);

    void pollJobs({ silent: true });

    return () => {
      window.clearInterval(intervalId);
    };
  }, [jobs, pollJobs]);

  return (
    <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{t("table.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("table.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading || installing}>
            {loading ? t("refreshing") : t("actions.refresh")}
          </Button>
          <Button onClick={handleInstall} disabled={installing || loading}>
            {installing ? t("installing") : t("actions.install")}
          </Button>
        </div>
      </div>

      {actionError ? (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("actionErrorBanner", { error: actionError })}
        </div>
      ) : null}

      <div
        className="mt-6 rounded-2xl border border-border/30 bg-card/70 px-5 py-5 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        data-testid="ollama-jobs-section"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{tJobs("title")}</h3>
            <p className="text-sm text-muted-foreground">{tJobs("subtitle")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            data-testid="ollama-jobs-refresh"
            onClick={() => void pollJobs()}
            disabled={jobsRefreshing}
          >
            {jobsRefreshing ? tJobs("refreshing") : tJobs("refresh")}
          </Button>
        </div>

        <div className="mt-4 space-y-6">
          <section>
            <h4 className="text-sm font-semibold text-foreground">{tJobs("activeTitle")}</h4>
            {activeJobs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{tJobs("empty")}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {activeJobs.map((job) => (
                  <li
                    key={job.id}
                    data-testid="ollama-job-active"
                    className="flex items-start justify-between gap-4 rounded-xl border border-border/30 bg-background/60 px-4 py-3"
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-3">
                        {renderStatusIndicator(job.status)}
                        <div>
                          <p className="text-sm font-medium text-foreground">{job.model}</p>
                          <p className="text-xs text-muted-foreground">{jobTimelineText(job)}</p>
                        </div>
                      </div>
                      <p className="pl-5 text-xs text-muted-foreground">{jobDetailText(job)}</p>
                    </div>
                    <Badge variant="outline" className={`self-start ${statusBadgeClasses[job.status]}`}>
                      {jobStatusLabel(job.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="text-sm font-semibold text-foreground">{tJobs("recentTitle")}</h4>
            {recentJobs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{tJobs("recentEmpty")}</p>
            ) : (
              <ul className="mt-3 space-y-3" data-testid="ollama-job-recent">
                {recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border/20 bg-background/40 px-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        {renderStatusIndicator(job.status)}
                        <div>
                          <p className="text-sm font-medium text-foreground">{job.model}</p>
                          <p className="text-xs text-muted-foreground">{jobTimelineText(job)}</p>
                        </div>
                      </div>
                      <p className="pl-5 text-xs text-muted-foreground">{jobDetailText(job)}</p>
                    </div>
                    <Badge variant="outline" className={`self-start ${statusBadgeClasses[job.status]}`}>
                      {jobStatusLabel(job.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>{tTable("name")}</TableHead>
            <TableHead>{tTable("size")}</TableHead>
            <TableHead>{tTable("modified")}</TableHead>
          <TableHead>{tTable("digest")}</TableHead>
          <TableHead className="text-right">{t("table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <TableRow key={model.name}>
            <TableCell className="font-medium text-foreground">{model.name}</TableCell>
            <TableCell>{model.size ?? "—"}</TableCell>
            <TableCell>{model.modified_at ?? "—"}</TableCell>
            <TableCell className="break-all text-xs text-muted-foreground">
              {model.digest ?? "—"}
            </TableCell>
            <TableCell className="space-y-2 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {defaults.chat_model === model.name ? (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {t("badgeChat")}
                  </Badge>
                ) : null}
                {defaults.embedding_model === model.name ? (
                  <Badge variant="outline" className="border-amber-500/70 text-amber-500">
                    {t("badgeEmbedding")}
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingDefaults || loading}
                  onClick={() => updateDefaults({ chat_model: model.name })}
                >
                  {t("actions.setChat")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingDefaults || loading}
                  onClick={() => updateDefaults({ embedding_model: model.name })}
                >
                  {t("actions.setEmbedding")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading || installing}
                  onClick={() => handleDelete(model.name)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
        {models.length === 0 ? <TableCaption>{t("empty")}</TableCaption> : null}
      </Table>

      {error ? (
        <p className="mt-4 text-sm text-red-500">{t("loadError", { error })}</p>
      ) : null}
    </div>
  );
}

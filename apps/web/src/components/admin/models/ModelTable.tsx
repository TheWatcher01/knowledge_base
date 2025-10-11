"use client";

import { useCallback, useState } from "react";
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
  type ModelDefaults,
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

  const [models, setModels] = useState<OllamaModelSummary[]>(initialModels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [installing, setInstalling] = useState(false);
  const [defaults, setDefaults] = useState<ModelDefaults>(initialDefaults);
  const [updatingDefaults, setUpdatingDefaults] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await listModels();
      setModels(next);
      const defaultsResponse = await getModelDefaults();
      setDefaults(defaultsResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(t("refreshError", { error: message }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleInstall = useCallback(async () => {
    const modelName = window.prompt(t("installPrompt"));
    if (!modelName) {
      return;
    }

    setInstalling(true);
    try {
      await pullModel(modelName.trim());
      toast.success(t("installSuccess", { name: modelName }));
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(t("installError", { error: message }));
    } finally {
      setInstalling(false);
    }
  }, [refresh, t]);

  const handleDelete = useCallback(
    async (name: string) => {
      if (!window.confirm(t("deleteConfirm", { name }))) {
        return;
      }

      setLoading(true);
      try {
        await deleteModel(name);
        toast.success(t("deleteSuccess", { name }));
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(t("deleteError", { error: message }));
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(t("defaultsError", { error: message }));
      } finally {
        setUpdatingDefaults(false);
      }
    },
    [t],
  );

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

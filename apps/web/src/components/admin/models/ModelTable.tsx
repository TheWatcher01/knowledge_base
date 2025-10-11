"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listModels, pullModel, OllamaModelSummary } from "@/lib/models";
import { toast } from "sonner";

type Props = {
  initialModels: OllamaModelSummary[];
  initialError?: string;
};

export default function ModelTable({ initialModels, initialError }: Props) {
  const t = useTranslations("admin.models");
  const tTable = useTranslations("admin.models.table");

  const [models, setModels] = useState<OllamaModelSummary[]>(initialModels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [installing, setInstalling] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await listModels();
      setModels(next);
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

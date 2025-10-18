"use client";

import { UploadIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { DropEvent, DropzoneOptions, FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DropzoneContextType = {
  src?: File[];
  accept?: DropzoneOptions["accept"];
  maxSize?: DropzoneOptions["maxSize"];
  minSize?: DropzoneOptions["minSize"];
  maxFiles?: DropzoneOptions["maxFiles"];
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);

export type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
  src?: File[];
  className?: string;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
  children?: ReactNode;
};

const maxLabelItems = 3;

export function Dropzone({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        if (message) {
          onError?.(new Error(message));
        }
        return;
      }

      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props,
  });

  return (
    <DropzoneContext.Provider key={JSON.stringify(src)} value={{ src, accept, maxSize, minSize, maxFiles }}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "relative flex h-auto w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed border-border/60 bg-background/60 p-8 text-center transition",
          isDragActive && "border-primary/60 bg-primary/5",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
        disabled={disabled}
        {...getRootProps()}
      >
        <input {...getInputProps()} disabled={disabled} />
        {children}
      </Button>
    </DropzoneContext.Provider>
  );
}

export type DropzoneEmptyStateProps = {
  children?: ReactNode;
  className?: string;
};

export function DropzoneEmptyState({ children, className }: DropzoneEmptyStateProps) {
  const context = useDropzoneContext();
  if (context.src) {
    return null;
  }

  if (children) {
    return <div className={className}>{children}</div>;
  }

  const { accept, maxSize, minSize, maxFiles } = context;
  const captionParts: string[] = [];

  if (accept && Object.keys(accept).length > 0) {
    captionParts.push(
      new Intl.ListFormat("en", { style: "long" }).format(
        Object.keys(accept).map((key) => key.toUpperCase().replace("IMAGE/", "")),
      ),
    );
  }
  if (minSize && maxSize) {
    captionParts.push(`${formatBytes(minSize)} - ${formatBytes(maxSize)}`);
  } else if (minSize) {
    captionParts.push(`${formatBytes(minSize)} min`);
  } else if (maxSize) {
    captionParts.push(`${formatBytes(maxSize)} max`);
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground", className)}>
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadIcon className="size-4" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          {maxFiles === 1 ? "Glissez-déposez ou cliquez pour remplacer" : "Déposez vos fichiers ici"}
        </p>
        {captionParts.length > 0 ? <p className="text-xs">{captionParts.join(" • ")}</p> : null}
      </div>
    </div>
  );
}

export type DropzoneContentProps = {
  children?: ReactNode;
  className?: string;
};

export function DropzoneContent({ children, className }: DropzoneContentProps) {
  const context = useDropzoneContext();
  if (!context.src) {
    return null;
  }

  if (children) {
    return <div className={className}>{children}</div>;
  }

  const filenames =
    context.src.length > maxLabelItems
      ? `${context.src
          .slice(0, maxLabelItems)
          .map((file) => file.name)
          .join(", ")} +${context.src.length - maxLabelItems}`
      : context.src.map((file) => file.name).join(", ");

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground", className)}>
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadIcon className="size-4" aria-hidden />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-medium text-foreground">{filenames}</p>
        <p className="text-xs">Cliquez pour choisir un autre fichier.</p>
      </div>
    </div>
  );
}

function useDropzoneContext() {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error("Dropzone components must be used within <Dropzone>");
  }
  return context;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UrlStatus } from "@prisma/client";
import { createUrlContentPlaceholder, updateUrlContentStatus } from "@/lib/url-content";
import { OWUI_DISABLED_MESSAGE, deleteFromCollection, triggerWebIngestion } from "@/lib/owui";
import { upsertKnowledgeEntry, markNeedsEmbedding, markEmbedded, removeKnowledgeEntry } from "@/lib/knowledge-store";
import { assertRole, handleAuthError } from "@/lib/authz";

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

const OptionalTitle = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().max(120).optional(),
);

const OptionalDescription = z.preprocess(
  (value) => {
    if (value === null) {
      return null;
    }
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.string().max(500).nullable().optional(),
);

const OptionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      return new URL(trimmed).toString();
    } catch {
      try {
        return new URL(`https://${trimmed}`).toString();
      } catch {
        return trimmed;
      }
    }
  },
  z.string().max(2048).url().optional(),
);

const UpdateSchema = z
  .object({
    title: OptionalTitle,
    url: OptionalUrl,
    description: OptionalDescription,
    status: z.nativeEnum(UrlStatus).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "No changes provided",
  });

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
    const userId = session!.user.id;

    const resolvedParams = await context.params;
    const parsedParams = ParamsSchema.safeParse(resolvedParams);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: { id: parsedParams.data.id, type: "url", kb: { ownerId: userId } },
      select: {
        id: true,
        title: true,
        source: true,
        createdAt: true,
        urlEntry: {
          select: {
            id: true,
            url: true,
            description: true,
            status: true,
            externalId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!document || !document.urlEntry) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json({
      url: {
        id: document.id,
        title: document.title,
        url: document.urlEntry.url,
        description: document.urlEntry.description,
        status: document.urlEntry.status,
        externalId: document.urlEntry.externalId,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.urlEntry.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN"]);
    const userId = session!.user.id;

    const parsedParams = ParamsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsedBody = UpdateSchema.safeParse(payload);
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsedBody.error.flatten() }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: parsedParams.data.id,
        type: "url",
        kb: { ownerId: userId },
      },
      select: {
        id: true,
        kbId: true,
        title: true,
        source: true,
        urlEntry: {
          select: {
            id: true,
            url: true,
            description: true,
            status: true,
            externalId: true,
            updatedAt: true,
          },
        },
        createdAt: true,
      },
    });

    if (!document || !document.urlEntry) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const existingEntry = document.urlEntry;

    const nextUrl = parsedBody.data.url ?? document.urlEntry.url;
    const urlChanged = parsedBody.data.url !== undefined && parsedBody.data.url !== existingEntry.url;
    const nextTitle = parsedBody.data.title ?? document.title;
    const descriptionProvided = parsedBody.data.description !== undefined;
    const nextDescription = descriptionProvided ? parsedBody.data.description : existingEntry.description;
    const nextStatus = parsedBody.data.status ?? (urlChanged ? UrlStatus.draft : existingEntry.status);

    let externalId = existingEntry.externalId ?? null;
    if (urlChanged) {
      const created = await createUrlContentPlaceholder({ url: nextUrl, status: nextStatus }).catch(() => null);
      externalId = created ?? null;
    }

    const record = await prisma.$transaction(async (tx) => {
      const updatedDocument = await tx.document.update({
        where: { id: document.id },
        data: {
          ...(parsedBody.data.title !== undefined ? { title: nextTitle } : {}),
          ...(urlChanged ? { source: nextUrl } : {}),
        },
        select: {
          id: true,
          kbId: true,
          title: true,
          createdAt: true,
        },
      });

      const updatedEntry = await tx.urlEntry.update({
        where: { documentId: document.id },
        data: {
          ...(urlChanged ? { url: nextUrl } : {}),
          ...(descriptionProvided ? { description: nextDescription } : {}),
          status: nextStatus,
          ...(externalId !== existingEntry.externalId ? { externalId } : {}),
        },
        select: {
          url: true,
          description: true,
          status: true,
          externalId: true,
          updatedAt: true,
        },
      });

      return { document: updatedDocument, entry: updatedEntry };
    });

    let entry = record.entry;
    let ingestionError: string | undefined;

    await upsertKnowledgeEntry({
      kbId: record.document.kbId,
      documentId: record.document.id,
      type: "url",
      ingestMethod: "web",
      source: record.entry.url,
      metadata: {
        description: record.entry.description,
        status: record.entry.status,
      },
    });

    if (urlChanged) {
      await markNeedsEmbedding(record.document.id);
    }

    const shouldTriggerIngestion = urlChanged || parsedBody.data.status === UrlStatus.queued;

    if (shouldTriggerIngestion) {
      const ingestion = await triggerWebIngestion({ kbId: record.document.kbId, url: record.entry.url });

      let finalStatus = record.entry.status;
      if (ingestion.ok) {
        finalStatus = UrlStatus.queued;
      } else {
        ingestionError = ingestion.error;
        if (ingestion.error !== OWUI_DISABLED_MESSAGE) {
          finalStatus = UrlStatus.error;
        }
      }

      if (finalStatus !== record.entry.status) {
        entry = await prisma.urlEntry.update({
          where: { documentId: record.document.id },
          data: { status: finalStatus },
          select: {
            url: true,
            description: true,
            status: true,
            externalId: true,
            updatedAt: true,
          },
        });
      }
    }

    if (entry.externalId) {
      await updateUrlContentStatus({ externalId: entry.externalId, status: entry.status });
    }

    if (entry.status === UrlStatus.queued) {
      await markEmbedded(record.document.id);
    }

    return NextResponse.json(
      {
        url: {
          id: record.document.id,
          kbId: record.document.kbId,
          title: record.document.title,
          url: entry.url,
          description: entry.description,
          status: entry.status,
          externalId: entry.externalId,
          createdAt: record.document.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
          ingestionError,
        },
      },
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN"]);
    const userId = session!.user.id;

    const parsedParams = ParamsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: parsedParams.data.id,
        type: "url",
        kb: { ownerId: userId },
      },
      select: { id: true, kbId: true, source: true, urlEntry: true },
    });

    if (!document || !document.urlEntry) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.urlEntry.delete({ where: { documentId: document.id } });
      await tx.document.delete({ where: { id: document.id } });
    });

    await removeKnowledgeEntry(document.id);

    if (document.urlEntry.externalId) {
      await deleteFromCollection({ kbId: document.kbId, documentId: document.id });
      await updateUrlContentStatus({ externalId: document.urlEntry.externalId, status: UrlStatus.error });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

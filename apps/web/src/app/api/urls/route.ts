import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UrlStatus } from "@prisma/client";
import { createUrlContentPlaceholder } from "@/lib/url-content";

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
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().max(500).optional(),
);

const CreateUrlSchema = z.object({
  kbId: z.string().uuid(),
  title: OptionalTitle,
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          try {
            new URL(`https://${value}`);
            return true;
          } catch {
            return false;
          }
        }
      },
      { message: "Invalid URL" },
    ),
  description: OptionalDescription,
  status: z.nativeEnum(UrlStatus).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = CreateUrlSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const kb = await prisma.knowledgeBase.findFirst({
    where: { id: parsed.data.kbId, ownerId: userId },
    select: { id: true },
  });

  if (!kb) {
    return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
  }

  const normalizedUrl = normalizeUrl(parsed.data.url);
  const status = parsed.data.status ?? UrlStatus.draft;
  const title = parsed.data.title ?? deriveTitleFromUrl(normalizedUrl);
  const description = parsed.data.description ?? null;

  const externalId = await createUrlContentPlaceholder({ url: normalizedUrl, status }).catch(() => null);

  const record = await prisma.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        kbId: parsed.data.kbId,
        title,
        type: "url",
        source: normalizedUrl,
      },
      select: {
        id: true,
        title: true,
        kbId: true,
        createdAt: true,
      },
    });

    const entry = await tx.urlEntry.create({
      data: {
        documentId: document.id,
        url: normalizedUrl,
        description,
        status,
        externalId,
      },
      select: {
        url: true,
        description: true,
        status: true,
        externalId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { document, entry };
  });

  return NextResponse.json(
    {
      url: {
        id: record.document.id,
        kbId: record.document.kbId,
        title: record.document.title,
        url: record.entry.url,
        description: record.entry.description,
        status: record.entry.status,
        externalId: record.entry.externalId,
        createdAt: record.document.createdAt.toISOString(),
        updatedAt: record.entry.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return new URL(`https://${trimmed}`).toString();
  }
}

function deriveTitleFromUrl(value: string) {
  try {
    const url = new URL(value);
    const pathname = url.pathname.replace(/\/+$/, "");
    if (pathname && pathname !== "/") {
      return `${url.hostname}${pathname}`.slice(0, 120);
    }
    return url.hostname;
  } catch {
    return value.slice(0, 120);
  }
}

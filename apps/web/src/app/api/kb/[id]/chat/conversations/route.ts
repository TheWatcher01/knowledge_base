import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { assertRole, handleAuthError } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const ListQuery = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
});

const CreateBody = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  model: z.string().trim().min(1).max(120).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
    const userId = session!.user.id;

    const { id: kbId } = await params;

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: kbId, ownerId: userId },
      select: { id: true },
    });

    if (!kb) {
      return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const parsedQuery = ListQuery.safeParse({ limit: url.searchParams.get("limit") });
    const limit = parsedQuery.success ? parsedQuery.data.limit ?? 50 : 50;

    const conversations = await prisma.chatConversation.findMany({
      where: { kbId, userId },
      orderBy: [{ pinned: "desc" }, { lastActivityAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        model: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
        archived: true,
        pinned: true,
        meta: true,
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN", "VIEWER"]);
    const userId = session!.user.id;

    const { id: kbId } = await params;

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: kbId, ownerId: userId },
      select: { id: true, name: true },
    });

    if (!kb) {
      return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const parsed = CreateBody.safeParse(payload ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { title, model, meta } = parsed.data;

    const conversation = await prisma.chatConversation.create({
      data: {
        kbId,
        userId,
        title: title ?? kb.name ?? "Conversation",
        model: model ?? null,
        meta: meta ? (meta as Prisma.JsonObject) : undefined,
      },
      select: {
        id: true,
        title: true,
        model: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
        archived: true,
        pinned: true,
        meta: true,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { assertRole, handleAuthError } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const ConversationParams = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
});

const UpdateBody = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  model: z.string().trim().min(1).max(120).optional().or(z.literal("")),
  summary: z.string().max(2000).optional().or(z.literal("")),
  archived: z.boolean().optional(),
  pinned: z.boolean().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
    const userId = session!.user.id;

    const parsedParams = ConversationParams.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { id: kbId, conversationId } = parsedParams.data;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, kbId, userId },
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
        messages: {
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            sequence: true,
            tokens: true,
            error: true,
            createdAt: true,
            meta: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN", "VIEWER"]);
    const userId = session!.user.id;

    const parsedParams = ConversationParams.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { id: kbId, conversationId } = parsedParams.data;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, kbId, userId },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const parsed = UpdateBody.safeParse(payload ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title;
    }
    if (parsed.data.model !== undefined) {
      data.model = parsed.data.model || null;
    }
    if (parsed.data.summary !== undefined) {
      data.summary = parsed.data.summary || null;
    }
    if (parsed.data.archived !== undefined) {
      data.archived = parsed.data.archived;
    }
    if (parsed.data.pinned !== undefined) {
      data.pinned = parsed.data.pinned;
    }
    if (parsed.data.meta !== undefined) {
      data.meta = parsed.data.meta as Prisma.JsonObject;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updated = await prisma.chatConversation.update({
      where: { id: conversationId },
      data,
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

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN", "VIEWER"]);
    const userId = session!.user.id;

    const parsedParams = ConversationParams.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { id: kbId, conversationId } = parsedParams.data;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, kbId, userId },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await prisma.chatConversation.delete({ where: { id: conversationId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { owuiJson } from "@/lib/rag";
import { OWUI_BASE, collectionName } from "@/lib/config";
import { upsertKnowledgeEntry, markEmbedded } from "@/lib/knowledge-store";
import { assertRole, handleAuthError } from "@/lib/authz";

const Body = z.object({
  kbId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN"]);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { kbId, title, content } = parsed.data;

    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: kbId, ownerId: session!.user.id },
    });
    if (!kb) {
      return NextResponse.json(
        { error: "Knowledge base not found" },
        { status: 404 },
      );
    }

    const note = await prisma.document.create({
      data: {
        kbId,
        title,
        type: "note",
        source: content,
      },
    });

    await upsertKnowledgeEntry({
      kbId,
      documentId: note.id,
      type: "note",
      ingestMethod: "text",
      content,
    });

    let ingestionStatus: "success" | "skipped" | "failed" = "skipped";

    if (OWUI_BASE && process.env.MOCK_OPEN_WEBUI !== "true") {
      try {
        await owuiJson("/api/v1/retrieval/process/text", {
          method: "POST",
          body: JSON.stringify({
            name: note.id,
            content,
            collection_name: collectionName(kbId),
          }),
        });
        ingestionStatus = "success";
        await markEmbedded(note.id);
      } catch (error) {
        console.warn("[api/notebook] RAG service unavailable, note created without ingestion.", error);
        ingestionStatus = "failed";
      }
    } else if (process.env.MOCK_OPEN_WEBUI === "true") {
      ingestionStatus = "skipped";
    } else {
      ingestionStatus = "failed";
    }

    return NextResponse.json({
      ok: true,
      note,
      ingestionStatus,
      message:
        ingestionStatus === "failed"
          ? "Note saved but AI ingestion failed."
          : undefined,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

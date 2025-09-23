import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { owuiJson } from "@/lib/owui";
import { collectionName, OWUI_BASE } from "@/lib/config";

const Body = z.object({
  kbId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { kbId, title, content } = parsed.data;

  const kb = await prisma.knowledgeBase.findFirst({
    where: { id: kbId, ownerId: session.user.id },
  });
  if (!kb) {
    return NextResponse.json(
      { error: "Knowledge base not found" },
      { status: 404 },
    );
  }

  let ingestionStatus: "success" | "skipped" | "failed" = "skipped";

  if (OWUI_BASE) {
    try {
      await owuiJson("/retrieval/process/text", {
        method: "POST",
        body: JSON.stringify({
          text: content,
          collection_name: collectionName(kbId),
        }),
      });
      ingestionStatus = "success";
    } catch (error) {
      console.warn(
        "[api/notebook] Open WebUI unavailable, note creation continued.",
        error,
      );

      if (process.env.MOCK_OPEN_WEBUI === "true") {
        ingestionStatus = "skipped";
      } else {
        ingestionStatus = "failed";
      }
    }
  }

  const note = await prisma.document.create({
    data: {
      kbId,
      title,
      type: "note",
      source: content,
    },
  });

  return NextResponse.json({
    ok: true,
    note,
    ingestionStatus,
    message:
      ingestionStatus === "failed"
        ? "Note saved but AI ingestion failed."
        : undefined,
  });
}

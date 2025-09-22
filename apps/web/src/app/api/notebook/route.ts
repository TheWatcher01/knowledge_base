import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { owuiJson } from "@/lib/owui";
import { collectionName } from "@/lib/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const Body = z.object({ kbId: z.string().uuid(), title: z.string().min(1), content: z.string().min(1) });

export async function POST(req: NextRequest) {
  const { kbId, title, content } = Body.parse(await req.json());

  await owuiJson(`/retrieval/process/text`, {
    method: "POST",
    body: JSON.stringify({ text: content, collection_name: collectionName(kbId) })
  });

  await prisma.document.create({ data: { kbId, title, type: "note" } });

  return NextResponse.json({ ok: true });
}

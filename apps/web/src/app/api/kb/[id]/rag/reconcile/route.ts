import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { assertRole, handleAuthError } from "@/lib/authz";
import { ensureCollectionForKnowledgeBase } from "@/lib/rag-sync";
import { prisma } from "@/lib/prisma";

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    assertRole(session, ["EDITOR", "ADMIN"]);

    const parsedParams = ParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid knowledge base id" }, { status: 400 });
    }

    const kb = await prisma.knowledgeBase.findFirst({
      where: {
        id: parsedParams.data.id,
        ownerId: session!.user.id,
      },
      select: { id: true },
    });

    if (!kb) {
      return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
    }

    const result = await ensureCollectionForKnowledgeBase(parsedParams.data.id);

    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch (error) {
    return handleAuthError(error);
  }
}

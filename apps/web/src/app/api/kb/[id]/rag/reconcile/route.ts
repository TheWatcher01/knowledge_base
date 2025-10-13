import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { timingSafeEqual } from "crypto";

import { authOptions } from "@/lib/auth";
import { assertRole, handleAuthError } from "@/lib/authz";
import { ensureCollectionForKnowledgeBase } from "@/lib/rag-sync";
import { prisma } from "@/lib/prisma";

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

function tokensMatch(expected: string, provided: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = ParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid knowledge base id" }, { status: 400 });
    }

    const serviceToken = process.env.RAG_SYNC_SERVICE_TOKEN;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const isServiceRequest = Boolean(
      serviceToken && bearerToken && tokensMatch(serviceToken, bearerToken),
    );

    let ownerId: string | null = null;
    if (!isServiceRequest) {
      const session = await getServerSession(authOptions);
      assertRole(session, ["EDITOR", "ADMIN"]);
      ownerId = session!.user.id;
    }

    const kb = await prisma.knowledgeBase.findFirst({
      where: {
        id: parsedParams.data.id,
        ...(ownerId ? { ownerId } : {}),
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

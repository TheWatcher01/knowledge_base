import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRole, handleAuthError } from "@/lib/authz";
import { scheduleRagSync } from "@/lib/rag-sync-scheduler";

const CreateBody = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);

        const knoledgeBases = await prisma.knowledgeBase.findMany({
            where: { ownerId: session!.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(knoledgeBases);
    } catch (error) {
        return handleAuthError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);

        const body = CreateBody.safeParse(await request.json());
        if (!body.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const kb = await prisma.knowledgeBase.create({
            data: {
                name: body.data.name,
                description: body.data.description,
                ownerId: session!.user.id,
            },
        });

        scheduleRagSync(kb.id, { delayMs: 1_000 });

        return NextResponse.json({ knowledgeBase: kb }, { status: 201 });
    } catch (error) {
        return handleAuthError(error);
    }
}

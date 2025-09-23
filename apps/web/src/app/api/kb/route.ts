import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateBody = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knoledgeBases = await prisma.knowledgeBase.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(knoledgeBases);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = CreateBody.safeParse(await request.json());
    if (!body.success) {
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 }
        );
    }

    const kb = await prisma.knowledgeBase.create({
        data: {
            name: body.data.name,
            description: body.data.description,
            ownerId: session.user.id,
        },
    });

    return NextResponse.json({ knowledgeBase: kb }, { status: 201 });
}

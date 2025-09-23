import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kb = await prisma.knowledgeBase.findUnique({
        where: { id, ownerId: session.user.id },
    });
    if (!kb) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.knowledgeBase.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}

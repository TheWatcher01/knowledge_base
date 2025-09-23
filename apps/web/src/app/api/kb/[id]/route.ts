import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: Request, { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kb = await prisma.knowledgeBase.findUnique({
        where: { id: params.id, ownerId: session.user.id },
    });
    if (!kb) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.knowledgeBase.delete({
        where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertRole, handleAuthError } from "@/lib/authz";
import { markNeedsEmbedding, upsertKnowledgeEntry, removeKnowledgeEntry } from "@/lib/knowledge-store";

const UpdateBody = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);

        const parsed = UpdateBody.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { title, content } = parsed.data;

        const note = await prisma.document.findFirst({
            where: { id, type: "note", kb: { ownerId: session!.user.id } },
            select: { id: true, kbId: true },
        });
        if (!note) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: { title, source: content },
        });

        await upsertKnowledgeEntry({
            kbId: note.kbId,
            documentId: note.id,
            type: "note",
            ingestMethod: "text",
            content,
        });
        await markNeedsEmbedding(note.id);

        return NextResponse.json({ note: updated });
    } catch (error) {
        return handleAuthError(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);

        const note = await prisma.document.findFirst({
            where: { id, type: "note", kb: { ownerId: session!.user.id } },
        });
        if (!note) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.document.delete({ where: { id } });
        await removeKnowledgeEntry(id);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}

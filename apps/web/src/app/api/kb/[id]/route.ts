import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OWUI_BASE, collectionName } from "@/lib/config";
import { owuiJson } from "@/lib/owui";
import { assertRole, handleAuthError } from "@/lib/authz";
import { removeKnowledgeEntriesForKb } from "@/lib/knowledge-store";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const kb = await prisma.knowledgeBase.findFirst({
            where: { id, ownerId: userId },
            include: { documents: true },
        });
        if (!kb) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (OWUI_BASE && process.env.MOCK_OPEN_WEBUI !== "true") {
            const deletions = kb.documents.map((document) =>
                owuiJson("/api/v1/retrieval/delete", {
                    method: "POST",
                    body: JSON.stringify({
                        collection_name: collectionName(id),
                        file_id: document.id,
                    }),
                }),
            );

            const results = await Promise.allSettled(deletions);
            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.warn(
                        `[api/kb/${id}] Failed to delete Open WebUI entry ${kb.documents[index]?.id}.`,
                        result.reason,
                    );
                }
            });
        }

        await prisma.$transaction([
            prisma.document.deleteMany({ where: { kbId: id } }),
            prisma.knowledgeBase.delete({ where: { id } }),
        ]);

        await removeKnowledgeEntriesForKb(id);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}

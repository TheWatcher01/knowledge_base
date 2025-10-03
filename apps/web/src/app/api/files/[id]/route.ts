import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { assertRole, handleAuthError } from "@/lib/authz";
import { removeKnowledgeEntry, upsertKnowledgeEntry, markNeedsEmbedding } from "@/lib/knowledge-store";

const ParamsSchema = z.object({
    id: z.string().uuid(),
});

const PatchFormSchema = z.object({
    title: z.string().min(1).optional(),
});

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const parsed = ParamsSchema.safeParse({ id });
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
        }

        const asset = await prisma.fileAsset.findFirst({
            where: {
                documentId: parsed.data.id,
                document: {
                    kb: { ownerId: userId },
                },
            },
            select: {
                data: true,
                mimeType: true,
                size: true,
                document: {
                    select: { title: true, source: true },
                },
            },
        });

        if (!asset) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const dispositionName = asset.document.source ?? `${asset.document.title}.bin`;
        return new Response(Buffer.from(asset.data), {
            headers: {
                "Content-Type": asset.mimeType,
                "Content-Length": asset.size.toString(),
                "Content-Disposition": `attachment; filename="${encodeURIComponent(dispositionName)}"`,
            },
        });
    } catch (error) {
        return handleAuthError(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const parsed = ParamsSchema.safeParse({ id });
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
        }

        const document = await prisma.document.findFirst({
            where: {
                id: parsed.data.id,
                type: "file",
                kb: { ownerId: userId },
            },
            select: { id: true },
        });

        if (!document) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.fileAsset.deleteMany({ where: { documentId: document.id } });
            await tx.document.delete({ where: { id: document.id } });
        });

        await removeKnowledgeEntry(document.id);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const parsedParams = ParamsSchema.safeParse({ id });
        if (!parsedParams.success) {
            return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
        }

        const formData = await request.formData();
        const rawTitle = formData.get("title");
        const maybeFile = formData.get("file");

        const parsedForm = PatchFormSchema.safeParse({
            title: typeof rawTitle === "string" && rawTitle.trim().length > 0 ? rawTitle.trim() : undefined,
        });

        if (!parsedForm.success) {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }
        const nextTitle = parsedForm.data.title;
        const hasFile = maybeFile instanceof File;

        if (!nextTitle && !hasFile) {
            return NextResponse.json({ error: "No changes provided" }, { status: 400 });
        }

        const existing = await prisma.document.findFirst({
            where: {
                id: parsedParams.data.id,
                type: "file",
                kb: { ownerId: userId },
            },
            select: {
                kbId: true,
                id: true,
                title: true,
                source: true,
                fileAsset: { select: { mimeType: true, size: true } },
            },
        });
        if (!existing || !existing.fileAsset) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        let buffer: Buffer | null = null;
        let mimeType = existing.fileAsset.mimeType;
        let size = existing.fileAsset.size;
        let originalName = existing.source ?? existing.title;

        if (hasFile) {
            const file = maybeFile as File;
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);

            if (buffer.length === 0) {
                return NextResponse.json({ error: "File is empty" }, { status: 400 });
            }

            mimeType = file.type || "application/octet-stream";
            size = buffer.length;
            originalName = file.name || nextTitle || existing.title;
        }

        await prisma.$transaction(async (tx) => {
            if (nextTitle || hasFile) {
                await tx.document.update({
                    where: { id: existing.id },
                    data: {
                        ...(nextTitle ? { title: nextTitle } : {}),
                        ...(hasFile ? { source: originalName } : {}),
                    },
                });
            }

            if (hasFile && buffer) {
                await tx.fileAsset.update({
                    where: { documentId: existing.id },
                    data: {
                        data: buffer,
                        mimeType,
                        size,
                    },
                });
            }
        });

        const textContent = mimeType.startsWith("text/")
            ? (buffer ? buffer.toString("utf8") : undefined)
            : undefined;

        await upsertKnowledgeEntry({
            kbId: existing.kbId,
            documentId: existing.id,
            type: "file",
            ingestMethod: "text",
            content: textContent,
            source: hasFile ? originalName : undefined,
            metadata: {
                mimeType,
                size,
            },
        });

        if (hasFile || textContent !== undefined) {
            await markNeedsEmbedding(existing.id);
        }

        return NextResponse.json(
            {
                file: {
                    id: existing.id,
                    title: nextTitle ?? existing.title,
                    mimeType,
                    size,
                    originalName,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        return handleAuthError(error);
    }
}

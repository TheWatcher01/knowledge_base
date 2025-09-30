import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRole, handleAuthError } from "@/lib/authz";
import { OWUI_BASE, collectionName } from "@/lib/config";
import { owuiJson } from "@/lib/owui";

const FormSchema = z.object({
    kbId: z.string().uuid(),
    title: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        assertRole(session, ["EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const formData = await request.formData();
        const file = formData.get("file");
        const parsed = FormSchema.safeParse({
            kbId: formData.get("kbId"),
            title: formData.get("title"),
        });

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length === 0) {
            return NextResponse.json({ error: "File is empty" }, { status: 400 });
        }

        const { kbId, title } = parsed.data;
        const kb = await prisma.knowledgeBase.findFirst({
            where: { id: kbId, ownerId: userId },
            select: { id: true },
        });

        if (!kb) {
            return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
        }

        const mimeType = file.type || "application/octet-stream";
        const size = buffer.length;
        const originalName = file.name || title;
        const document = await prisma.$transaction(async (tx) => {
            const createdDocument = await tx.document.create({
                data: {
                    kbId,
                    title,
                    type: "file",
                    source: originalName,
                },
                select: {
                    id: true,
                    title: true,
                    source: true,
                },
            });

            await tx.fileAsset.create({
                data: {
                    documentId: createdDocument.id,
                    data: buffer,
                    mimeType,
                    size,
                },
            });

            return createdDocument;
        });

        let ingestionStatus: "success" | "skipped" | "failed" = "skipped";
        let ingestionError: string | undefined;

        const shouldAttemptIngestion =
            OWUI_BASE &&
            process.env.MOCK_OPEN_WEBUI !== "true" &&
            mimeType.startsWith("text/");

        if (shouldAttemptIngestion) {
            try {
                const content = buffer.toString("utf8");
                if (content.trim().length > 0) {
                    await owuiJson("/api/v1/retrieval/process/text", {
                        method: "POST",
                        body: JSON.stringify({
                            name: document.id,
                            content,
                            collection_name: collectionName(kbId),
                        }),
                    });
                    ingestionStatus = "success";
                }
            } catch (error) {
                console.warn("[api/files] Open WebUI ingestion failed", error);
                ingestionStatus = "failed";
                ingestionError = error instanceof Error ? error.message : String(error);
            }
        } else if (process.env.MOCK_OPEN_WEBUI === "true") {
            ingestionStatus = "skipped";
        } else {
            ingestionStatus = "failed";
        }

        return NextResponse.json(
            {
                file: {
                    id: document.id,
                    title: document.title,
                    mimeType,
                    size,
                    originalName: document.source ?? originalName,
                    ingestionStatus,
                    ingestionError,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        return handleAuthError(error);
    }
}

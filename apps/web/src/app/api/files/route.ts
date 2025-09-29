import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define the schema for query parameters
const FormSchema = z.object({
    kbId: z.string().uuid(),
    title: z.string().min(1),
});

// Auth and access control
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Multipart form data parsing
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

    // Files conversion to exploitable binary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) {
        return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Ownership verification for the knowledge base
    const { kbId, title } = parsed.data;
    const kb = await prisma.knowledgeBase.findFirst({
        where: { id: kbId, ownerId: userId },
        select: { id: true },
    });

    if (!kb) {
        return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
    }

    // File record creation in the database
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

    // Respond with the created document details
    return NextResponse.json(
        {
            file: {
                id: document.id,
                title: document.title,
                mimeType,
                size,
                originalName: document.source ?? originalName,
            },
        },
        { status: 201 }
    );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define Zod schema for route parameters
const ParamsSchema = z.object({
    id: z.string().uuid(),
});

// Zod schema for PATCH request
const PatchFormSchema = z.object({
    title: z.string().min(1).optional(),
});


// Get handler
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth and access control
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate id parameter
    const resolvedParams = await params;
    const parsed = ParamsSchema.safeParse(resolvedParams);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }
    const { id } = parsed.data;

    // Fetch the file document ensuring ownership
    const asset = await prisma.fileAsset.findFirst({
        where: {
            documentId: id,
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

    // Binary response with appropriate headers
    const dispositionName = asset.document.source ?? `${asset.document.title}.bin`;
    return new Response(Buffer.from(asset.data), {
        headers: {
            "Content-Type": asset.mimeType,
            "Content-Length": asset.size.toString(),
            "Content-Disposition": `attachment; filename="${encodeURIComponent(
                dispositionName
            )}"`,
        },
    });
}

// Delete handler
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth and access control
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate id parameter
    const resolvedParams = await params;
    const parsed = ParamsSchema.safeParse(resolvedParams);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }
    const { id } = parsed.data;

    // Verify ownership and existence of the document
    const document = await prisma.document.findFirst({
        where: {
            id,
            type: "file",
            kb: { ownerId: userId },
        },
        select: { id: true },
    });

    if (!document) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the document and associated file asset in a transaction
    await prisma.$transaction(async (tx) => {
        await tx.fileAsset.deleteMany({ where: { documentId: document.id } });
        await tx.document.delete({ where: { id: document.id } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
}

// Patch handler
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth and access control
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate id parameter
    const resolvedParams = await params;
    const parsedParams = ParamsSchema.safeParse(resolvedParams);

    if (!parsedParams.success) {
        return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
    }
    const { id } = parsedParams.data;

    // Multipart form data parsing
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

    // Document load and ownership verification
    const existing = await prisma.document.findFirst({
        where: {
            id,
            type: "file",
            kb: { ownerId: userId },
        },
        select: {
            id: true,
            title: true,
            source: true,
            fileAsset: { select: { mimeType: true, size: true } },
        },
    });
    if (!existing || !existing.fileAsset) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Prepare update data
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

    // Update the document and file asset in a transaction
    await prisma.$transaction(async (tx) => {
        if (nextTitle || hasFile) {
            await tx.document.update({
                where: { id },
                data: {
                    ...(nextTitle ? { title: nextTitle } : {}),
                    ...(hasFile ? { source: originalName } : {}),
                },
            });
        }

        if (hasFile && buffer) {
            await tx.fileAsset.update({
                where: { documentId: id },
                data: {
                    data: buffer,
                    mimeType,
                    size,
                },
            });
        }
    });

    // Respond with updated file details
    return NextResponse.json(
        {
            file: {
                id,
                title: nextTitle ?? existing.title,
                mimeType,
                size,
                originalName,
            },
        },
        { status: 200 }
    );
}

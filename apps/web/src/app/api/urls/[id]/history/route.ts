import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRole, handleAuthError } from "@/lib/authz";

const ParamsSchema = z.object({
    id: z.string().uuid(),
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        const resolvedParams = await context.params;
        const parsedParams = ParamsSchema.safeParse(resolvedParams);
        if (!parsedParams.success) {
            return NextResponse.json({ error: "Invalid id parameter" }, { status: 400 });
        }

        const urlObj = new URL(request.url);
        const limitParam = urlObj.searchParams.get("limit");
        const limit = clamp(Number(limitParam ?? "20") || 20, 1, 100);

        const document = await prisma.document.findFirst({
            where: {
                id: parsedParams.data.id,
                type: "url",
                kb: { ownerId: userId },
            },
            select: {
                id: true,
                kbId: true,
                title: true,
                urlEntry: {
                    select: {
                        url: true,
                        status: true,
                        updatedAt: true,
                        jobs: {
                            orderBy: { queuedAt: "desc" },
                            take: limit,
                            select: {
                                id: true,
                                status: true,
                                queuedAt: true,
                                startedAt: true,
                                finishedAt: true,
                                errorMessage: true,
                                metadata: true,
                                updatedAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!document || !document.urlEntry) {
            return NextResponse.json({ error: "URL not found" }, { status: 404 });
        }

        const jobs = document.urlEntry.jobs.map((job) => ({
            id: job.id,
            status: job.status,
            queuedAt: job.queuedAt?.toISOString() ?? null,
            startedAt: job.startedAt?.toISOString() ?? null,
            finishedAt: job.finishedAt?.toISOString() ?? null,
            errorMessage: job.errorMessage ?? null,
            metadata: job.metadata ?? null,
            updatedAt: job.updatedAt.toISOString(),
        }));

        return NextResponse.json({
            document: {
                id: document.id,
                kbId: document.kbId,
                title: document.title,
                url: document.urlEntry.url,
                status: document.urlEntry.status,
                updatedAt: document.urlEntry.updatedAt.toISOString(),
            },
            jobs,
        });
    } catch (error) {
        return handleAuthError(error);
    }
}

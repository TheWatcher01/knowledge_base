import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { KnowledgeBaseMainPanel } from "./_components/kb-main-panel";
import { KnowledgeBaseSectionKey } from "./_components/kb-section-context";
import { OverviewStats } from "./_components/sections/overview-section";
import { NoteEntry } from "./_components/sections/notes-section";
import { FileEntry } from "./_components/sections/files-section";
import { UrlEntry } from "./_components/sections/urls-section";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
    searchParams?: Promise<{ section?: string; conversation?: string }>;
};

const SECTION_KEYS: KnowledgeBaseSectionKey[] = ["overview", "notes", "files", "urls", "chat"];

export default async function KnowledgeBasePage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearch = (await searchParams) ?? {};
    const { id } = resolvedParams;

    const session = await getServerSession(authOptions);
    const role = (session?.user?.role ?? "VIEWER") as "VIEWER" | "EDITOR" | "ADMIN";
    const canEdit = role !== "VIEWER";

    const sectionParam = resolvedSearch.section;
    const initialSection = SECTION_KEYS.includes(sectionParam as KnowledgeBaseSectionKey)
        ? (sectionParam as KnowledgeBaseSectionKey)
        : "overview";
    const initialConversationId = resolvedSearch.conversation ?? null;

    const [groupedCounts, noteRecords, fileRecords, urlRecords] = await Promise.all([
        prisma.document.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: { kbId: id },
        }),
        prisma.document.findMany({
            where: { kbId: id, type: "note" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                source: true,
                createdAt: true,
            },
        }),
        prisma.document.findMany({
            where: { kbId: id, type: "file" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                source: true,
                createdAt: true,
                fileAsset: {
                    select: {
                        size: true,
                        mimeType: true,
                    },
                },
            },
        }),
        prisma.document.findMany({
            where: { kbId: id, type: "url" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                urlEntry: {
                    select: {
                        url: true,
                        description: true,
                        status: true,
                        updatedAt: true,
                    },
                },
            },
        }),
    ]);

    const stats: OverviewStats = { note: 0, file: 0, url: 0 };
    for (const group of groupedCounts) {
        if (group.type === "note" || group.type === "file" || group.type === "url") {
            stats[group.type] = group._count._all;
        }
    }

    const notes: NoteEntry[] = noteRecords.map((note) => ({
        id: note.id,
        title: note.title ?? "Untitled note",
        content: note.source ?? "",
        createdAt: note.createdAt.toISOString(),
    }));

    const files: FileEntry[] = fileRecords.map((file) => ({
        id: file.id,
        title: file.title ?? "Untitled file",
        source: file.source ?? null,
        mimeType: file.fileAsset?.mimeType ?? "application/octet-stream",
        size: file.fileAsset?.size ?? 0,
        createdAt: file.createdAt.toISOString(),
    }));

    const urls: UrlEntry[] = urlRecords.flatMap((entry) => {
        if (!entry.urlEntry) return [];
        return [
            {
                id: entry.id,
                title: entry.title,
                url: entry.urlEntry.url,
                description: entry.urlEntry.description,
                status: entry.urlEntry.status,
                createdAt: entry.createdAt.toISOString(),
                updatedAt: entry.urlEntry.updatedAt.toISOString(),
            },
        ];
    });

    return (
        <KnowledgeBaseMainPanel
            kbId={id}
            canEdit={canEdit}
            stats={stats}
            notes={notes}
            files={files}
            urls={urls}
            initialSection={initialSection}
            initialConversationId={initialConversationId}
        />
    );
}

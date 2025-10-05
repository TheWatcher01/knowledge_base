"use client";

import { useEffect, useMemo, useRef } from "react";

import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";

import { KnowledgeBaseSectionKey, useKnowledgeBaseSection } from "./kb-section-context";
import { OverviewSection, OverviewNote, OverviewStats } from "./sections/overview-section";
import { NotesSection, NoteEntry } from "./sections/notes-section";
import { FilesSection, FileEntry } from "./sections/files-section";
import { UrlsSection, UrlEntry } from "./sections/urls-section";

type KnowledgeBaseMainPanelProps = {
    kbId: string;
    canEdit: boolean;
    stats: OverviewStats;
    notes: NoteEntry[];
    files: FileEntry[];
    urls: UrlEntry[];
    initialSection?: KnowledgeBaseSectionKey;
    initialConversationId?: string | null;
};

export function KnowledgeBaseMainPanel({
    kbId,
    canEdit,
    stats,
    notes,
    files,
    urls,
    initialSection,
    initialConversationId,
}: KnowledgeBaseMainPanelProps) {
    const { activeSection, setActiveSection, activeConversationId, setActiveConversationId } = useKnowledgeBaseSection();
    const sectionSyncedRef = useRef(false);
    const conversationSyncedRef = useRef(false);

    useEffect(() => {
        if (!sectionSyncedRef.current && initialSection) {
            sectionSyncedRef.current = true;
            setActiveSection(initialSection);
        }
    }, [initialSection, setActiveSection]);

    useEffect(() => {
        if (!conversationSyncedRef.current && typeof initialConversationId === "string") {
            conversationSyncedRef.current = true;
            setActiveConversationId(initialConversationId);
        }
    }, [initialConversationId, setActiveConversationId]);

    const overviewNotes: OverviewNote[] = useMemo(() => {
        return notes.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
        }));
    }, [notes]);

    let content: React.ReactNode = null;

    switch (activeSection) {
        case "notes":
            content = <NotesSection kbId={kbId} canEdit={canEdit} notes={notes} />;
            break;
        case "files":
            content = <FilesSection kbId={kbId} canEdit={canEdit} files={files} />;
            break;
        case "urls":
            content = <UrlsSection kbId={kbId} canEdit={canEdit} urls={urls} />;
            break;
        case "chat":
            content = (
                <KnowledgeBaseChatPanel
                    kbId={kbId}
                    activeConversationId={activeConversationId ?? initialConversationId ?? undefined}
                    onConversationChange={setActiveConversationId}
                />
            );
            break;
        case "overview":
        default:
            content = <OverviewSection stats={stats} notes={overviewNotes} />;
            break;
    }

    return <div className="min-h-full">{content}</div>;
}

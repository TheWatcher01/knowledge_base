"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type KnowledgeBaseSectionKey = "overview" | "notes" | "files" | "urls" | "chat";

type KnowledgeBaseSectionContextValue = {
    activeSection: KnowledgeBaseSectionKey;
    setActiveSection: (section: KnowledgeBaseSectionKey) => void;
    activeConversationId: string | null;
    setActiveConversationId: (conversationId: string | null) => void;
};

const KnowledgeBaseSectionContext = createContext<KnowledgeBaseSectionContextValue | undefined>(undefined);

type ProviderProps = {
    initialSection?: KnowledgeBaseSectionKey;
    initialConversationId?: string | null;
    children: React.ReactNode;
};

export function KnowledgeBaseSectionProvider({
    initialSection = "overview",
    initialConversationId = null,
    children,
}: ProviderProps) {
    const sectionRef = useRef(initialSection);
    const [activeSectionState, setActiveSectionState] = useState<KnowledgeBaseSectionKey>(initialSection);
    const [activeConversationIdState, setActiveConversationIdState] = useState<string | null>(initialConversationId);

    const setActiveSection = useCallback((section: KnowledgeBaseSectionKey) => {
        sectionRef.current = section;
        setActiveSectionState(section);
    }, []);

    const setActiveConversationId = useCallback((conversationId: string | null) => {
        setActiveConversationIdState(conversationId);
        if (conversationId && sectionRef.current !== "chat") {
            sectionRef.current = "chat";
            setActiveSectionState("chat");
        }
    }, []);

    const value = useMemo<KnowledgeBaseSectionContextValue>(() => {
        return {
            activeSection: activeSectionState,
            setActiveSection,
            activeConversationId: activeConversationIdState,
            setActiveConversationId,
        };
    }, [activeConversationIdState, activeSectionState, setActiveConversationId, setActiveSection]);

    return <KnowledgeBaseSectionContext.Provider value={value}>{children}</KnowledgeBaseSectionContext.Provider>;
}

export function useKnowledgeBaseSection() {
    const context = useContext(KnowledgeBaseSectionContext);
    if (!context) {
        throw new Error("useKnowledgeBaseSection must be used within a KnowledgeBaseSectionProvider");
    }
    return context;
}

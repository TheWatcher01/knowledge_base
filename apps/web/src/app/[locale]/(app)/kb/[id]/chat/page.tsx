import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";

export default async function ChatPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const resolvedParams = await params;
    return (
        <KnowledgeBaseChatPanel
            kbId={resolvedParams.id}
            className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80"
        />
    );
}

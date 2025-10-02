import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";

type PageProps = {
    params: { id: string };
};

export default function ChatPage({ params }: PageProps) {
    return (
        <KnowledgeBaseChatPanel
            kbId={params.id}
            className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80"
        />
    );
}

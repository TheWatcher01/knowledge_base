import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";

export default async function ChatPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const resolvedParams = await params;
    return <KnowledgeBaseChatPanel kbId={resolvedParams.id} />;
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const kbId = params.id;

    const [message, setMessage] = useState("");

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">AI Assistant</h1>
                <p className="text-muted-foreground">
                    Chat with the AI about knowledge base #{kbId}. The final interface will be connected to Open&nbsp;WebUI.
                </p>
            </header>

            <div className="rounded border p-6">
                <p className="text-muted-foreground mb-4">
                    Chat integration is in progress. Soon you’ll be able to ask questions and get contextual answers.
                </p>

                <form
                    className="space-y-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                    }}
                >
                    <label htmlFor="message" className="block font-medium">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="w-full rounded border p-3"
                        rows={3}
                        placeholder="Ask a question about this knowledge base…"
                        disabled
                        aria-disabled="true"
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled
                        aria-disabled="true"
                    >
                        Send (coming soon)
                    </button>
                </form>
            </div>
        </main>
    );
}

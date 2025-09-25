"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const kbId = params.id ?? "—";
    const t = useTranslations("kb.chat");

    const [message, setMessage] = useState("");

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description", { id: kbId })}</p>
            </header>

            <div className="rounded border p-6">
                <p className="text-muted-foreground mb-4">{t("status")}</p>

                <form
                    className="space-y-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                    }}
                >
                    <label htmlFor="message" className="block font-medium">
                        {t("label")}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="w-full rounded border p-3"
                        rows={3}
                        placeholder={t("placeholder")}
                        disabled
                        aria-disabled="true"
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled
                        aria-disabled="true"
                    >
                        {t("submit")}
                    </button>
                </form>
            </div>
        </main>
    );
}

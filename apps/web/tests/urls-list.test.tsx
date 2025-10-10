import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("next-intl", () => ({
    useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
    useFormatter: () => ({
        dateTime: (value: Date) => value.toISOString(),
    }),
}));

afterEach(() => {
    vi.restoreAllMocks();
    refreshMock.mockReset();
    delete (globalThis as typeof globalThis & { fetch?: unknown }).fetch;
});

describe("UrlRow", () => {
    async function renderRow(status: "draft" | "queued" | "synced" | "error") {
        const user = userEvent.setup();
        const { UrlsList } = await import("@/app/[locale]/(app)/kb/[id]/urls/_components/urls-list");
        render(
            <UrlsList
                canEdit
                urls={[
                    {
                        id: "doc-1",
                        title: "Titre",
                        url: "https://example.com",
                        description: null,
                        status,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ]}
            />,
        );
        return user;
    }

    test("affiche le bouton Re-synchroniser lorsque le statut est error", async () => {
        await renderRow("error");
        expect(screen.getByRole("button", { name: "kb.urlActions.resync" })).toBeInTheDocument();
    });

    test("clique sur Re-synchroniser force un PATCH et affiche queued", async () => {
        const user = await renderRow("error");
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ url: { status: "queued" } }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await user.click(screen.getByRole("button", { name: "kb.urlActions.resync" }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/urls/doc-1",
                expect.objectContaining({
                    method: "PATCH",
                    body: JSON.stringify({ status: "queued" }),
                }),
            );
            expect(screen.getByText("kb.urlForm.ingestionQueued")).toBeInTheDocument();
            expect(refreshMock).toHaveBeenCalled();
        });
    });

    test("le bouton Re-synchroniser n'est pas affiché quand le statut est synced", async () => {
        await renderRow("synced");
        expect(screen.queryByRole("button", { name: "kb.urlActions.resync" })).not.toBeInTheDocument();
    });
});

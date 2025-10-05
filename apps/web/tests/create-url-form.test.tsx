import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("next-intl", () => ({
    useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

describe("CreateUrlForm", () => {
beforeEach(() => {
    refreshMock.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as typeof globalThis & { fetch?: unknown }).fetch;
});

    async function setup(fetchResponse: { ok: boolean; json: () => Promise<unknown> }) {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fetchResponse));
        const { CreateUrlForm } = await import("@/app/[locale]/(app)/kb/[id]/_components/urls/create-url-form");
        const user = userEvent.setup();
        render(<CreateUrlForm kbId="kb-test" canEdit />);

        await user.type(screen.getByPlaceholderText("kb.urlForm.titlePlaceholder"), "Titre");
        await user.type(screen.getByPlaceholderText("kb.urlForm.urlPlaceholder"), "https://example.com");
        await user.type(screen.getByPlaceholderText("kb.urlForm.descriptionPlaceholder"), "Description");

        await user.click(screen.getByRole("button", { name: "kb.urlForm.submit" }));
    }

    test("affiche l'information d'ingestion quand le statut est queued", async () => {
        await setup({
            ok: true,
            json: () => Promise.resolve({ url: { status: "queued" } }),
        });

        await waitFor(() => {
            expect(screen.getByText("kb.urlForm.ingestionQueued")).toBeInTheDocument();
        });
        expect(refreshMock).toHaveBeenCalled();
    });

    test("affiche le message désactivé quand OWUI est indisponible", async () => {
        await setup({
            ok: true,
            json: () => Promise.resolve({ url: { ingestionError: "Open WebUI integration is disabled." } }),
        });

        await waitFor(() => {
            expect(screen.getByText("kb.urlForm.ingestionDisabled")).toBeInTheDocument();
        });
    });

    test("signale l'erreur lorsque le fetch échoue", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: "Custom error" }),
        }));
        const { CreateUrlForm } = await import("@/app/[locale]/(app)/kb/[id]/_components/urls/create-url-form");
        const user = userEvent.setup();
        render(<CreateUrlForm kbId="kb-test" canEdit />);

        await user.type(screen.getByPlaceholderText("kb.urlForm.titlePlaceholder"), "Titre");
        await user.type(screen.getByPlaceholderText("kb.urlForm.urlPlaceholder"), "https://example.com");
        await user.type(screen.getByPlaceholderText("kb.urlForm.descriptionPlaceholder"), "Description");
        await user.click(screen.getByRole("button", { name: "kb.urlForm.submit" }));

        await waitFor(() => {
            expect(screen.getByText("Custom error")).toBeInTheDocument();
        });
    });

    test("valide la présence de l'URL", async () => {
        const { CreateUrlForm } = await import("@/app/[locale]/(app)/kb/[id]/_components/urls/create-url-form");
        const user = userEvent.setup();
        render(<CreateUrlForm kbId="kb-test" canEdit />);

        await user.click(screen.getByRole("button", { name: "kb.urlForm.submit" }));

        expect(screen.getByText("kb.urlForm.urlRequired")).toBeInTheDocument();
        expect(global.fetch).toBeUndefined();
    });
});

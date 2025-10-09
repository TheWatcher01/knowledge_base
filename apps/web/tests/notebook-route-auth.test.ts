import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getServerSessionMock = vi.fn();
const knowledgeBaseFindFirst = vi.fn();
const documentCreate = vi.fn();

vi.mock("next-auth", () => ({
    getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        knowledgeBase: { findFirst: knowledgeBaseFindFirst },
        document: { create: documentCreate },
    },
}));

vi.mock("@/lib/rag", () => ({
    owuiJson: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
    OWUI_BASE: undefined,
    collectionName: vi.fn(),
}));

describe("POST /api/notebook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getServerSessionMock.mockReset();
        knowledgeBaseFindFirst.mockReset();
        documentCreate.mockReset();
    });

    test("returns 403 when the user only has viewer access", async () => {
        getServerSessionMock.mockResolvedValue({ user: { id: "viewer-1", role: "VIEWER" } });

        const { POST } = await import("@/app/api/notebook/route");
        const jsonMock = vi.fn().mockResolvedValue({
            kbId: "00000000-0000-0000-0000-000000000000",
            title: "My note",
            content: "Body",
        });

        const response = await POST({ json: jsonMock } as unknown as NextRequest);

        expect(getServerSessionMock).toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ message: "Forbidden" });
        expect(documentCreate).not.toHaveBeenCalled();
    });
});

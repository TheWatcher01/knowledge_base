import { beforeEach, describe, expect, test, vi } from "vitest";

const hashMock = vi.fn();

const prismaUserMock = {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
};

const prismaKnowledgeBaseMock = {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
};

const prismaDocumentMock = {
    deleteMany: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: prismaUserMock,
        knowledgeBase: prismaKnowledgeBaseMock,
        document: prismaDocumentMock,
    },
}));

vi.mock("bcrypt", () => ({
    default: { hash: hashMock },
    hash: hashMock,
}));

describe("lib/users helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("listUsers applique la recherche et la pagination", async () => {
        const now = new Date("2025-01-01T00:00:00Z");
        prismaUserMock.findMany.mockResolvedValue([
            { id: "1", email: "user@example.com", name: "User", role: "VIEWER", disabled: false, createdAt: now },
        ]);
        prismaUserMock.count.mockResolvedValue(1);

        const { listUsers } = await import("@/lib/users");
        const result = await listUsers({ page: 2, pageSize: 10, search: "Ted" });

        expect(prismaUserMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 10,
                take: 10,
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ email: expect.anything() }),
                        expect.objectContaining({ name: expect.anything() }),
                    ]),
                }),
            }),
        );
        expect(prismaUserMock.count).toHaveBeenCalled();
        expect(result).toEqual({
            users: [
                { id: "1", email: "user@example.com", name: "User", role: "VIEWER", disabled: false, createdAt: now },
            ],
            total: 1,
        });
    });

    test("listUsers sans recherche n'ajoute pas de filtre", async () => {
        prismaUserMock.findMany.mockResolvedValue([]);
        prismaUserMock.count.mockResolvedValue(0);

        const { listUsers } = await import("@/lib/users");
        await listUsers({ page: 1, pageSize: 20 });

        expect(prismaUserMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: undefined }),
        );
    });

    test("createUser normalise l'email et hash le mot de passe", async () => {
        const now = new Date("2025-03-01T00:00:00Z");
        hashMock.mockResolvedValue("hashed-password");
        prismaUserMock.create.mockResolvedValue({
            id: "42",
            email: "admin@example.com",
            role: "ADMIN",
            disabled: false,
            createdAt: now,
        });

        const { createUser } = await import("@/lib/users");
        const result = await createUser({ email: " Admin@Example.com ", password: "secret", role: "ADMIN" });

        expect(hashMock).toHaveBeenCalledWith("secret", 10);
        expect(prismaUserMock.create).toHaveBeenCalledWith({
            data: { email: "admin@example.com", passwordHash: "hashed-password", role: "ADMIN" },
            select: expect.anything(),
        });
        expect(result).toEqual({
            id: "42",
            email: "admin@example.com",
            role: "ADMIN",
            disabled: false,
            createdAt: now,
        });
    });

    test("updateUser met à jour les champs fournis", async () => {
        const now = new Date("2025-05-01T00:00:00Z");
        prismaUserMock.update.mockResolvedValue({
            id: "7",
            email: "user@example.com",
            role: "EDITOR",
            disabled: true,
            createdAt: now,
        });

        const { updateUser } = await import("@/lib/users");
        const result = await updateUser("7", { role: "EDITOR", disabled: true });

        expect(prismaUserMock.update).toHaveBeenCalledWith({
            where: { id: "7" },
            data: { role: "EDITOR", disabled: true },
            select: expect.anything(),
        });
        expect(result.role).toBe("EDITOR");
        expect(result.disabled).toBe(true);
    });

    test("updateUser sans données retourne l'utilisateur courant", async () => {
        const now = new Date("2025-06-01T00:00:00Z");
        prismaUserMock.findUnique.mockResolvedValue({
            id: "9",
            email: "viewer@example.com",
            role: "VIEWER",
            disabled: false,
            createdAt: now,
        });

        const { updateUser } = await import("@/lib/users");
        const result = await updateUser("9", {});

        expect(prismaUserMock.update).not.toHaveBeenCalled();
        expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
            where: { id: "9" },
            select: expect.anything(),
        });
        expect(result?.role).toBe("VIEWER");
    });

    test("deleteUser supprime les ressources associées", async () => {
        prismaKnowledgeBaseMock.findMany.mockResolvedValue([
            { id: "kb1" },
            { id: "kb2" },
        ]);
        prismaDocumentMock.deleteMany.mockResolvedValue({});
        prismaKnowledgeBaseMock.deleteMany.mockResolvedValue({});
        prismaUserMock.delete.mockResolvedValue({ id: "user123", email: "user@example.com" });

        const { deleteUser } = await import("@/lib/users");
        const result = await deleteUser("user123");

        expect(prismaDocumentMock.deleteMany).toHaveBeenCalledWith({ where: { kbId: { in: ["kb1", "kb2"] } } });
        expect(prismaKnowledgeBaseMock.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["kb1", "kb2"] } } });
        expect(prismaUserMock.delete).toHaveBeenCalledWith({
            where: { id: "user123" },
            select: expect.anything(),
        });
        expect(result).toEqual({ id: "user123", email: "user@example.com" });
    });
});

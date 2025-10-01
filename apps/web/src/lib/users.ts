import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

type UserRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

export async function listUsers(params: { page: number; pageSize: number; search?: string }) {
    const { page, pageSize, search } = params;
    const where: Prisma.UserWhereInput | undefined = search
        ? {
              OR: [
                  {
                      email: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                      },
                  },
                  {
                      name: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                      },
                  },
              ],
          }
        : undefined;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                disabled: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total };
}

export async function createUser(params: { email: string; password: string; role: 'VIEWER' | 'EDITOR' | 'ADMIN' }) {
    const { email, password, role } = params;
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: { email: email.toLowerCase().trim(), passwordHash, role },
        select: { id: true, email: true, role: true, disabled: true, createdAt: true },
    });
}

export async function updateUser(id: string,
    params: { role?: UserRole; disabled?: boolean },
) {
    const data: Record<string, unknown> = {};

    if (params.role) data.role = params.role;
    if (typeof params.disabled === "boolean") data.disabled = params.disabled;

    if (!Object.keys(data).length) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, role: true, createdAt: true, disabled: true },
        });
    }

    return prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, role: true, disabled: true, createdAt: true },
    });
}

export async function deleteUser(id: string) {
    const knowledgeBases = await prisma.knowledgeBase.findMany({
        where: { ownerId: id },
        select: { id: true },
    });

    const kbIds = knowledgeBases.map((kb) => kb.id);

    if (kbIds.length > 0) {
        await prisma.document.deleteMany({ where: { kbId: { in: kbIds } } });
        await prisma.knowledgeBase.deleteMany({ where: { id: { in: kbIds } } });
    }

    return prisma.user.delete({
        where: { id },
        select: {
            id: true,
            email: true,
        },
    });
}

import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type Role = "VIEWER" | "EDITOR" | "ADMIN";

export class AuthorizationError extends Error {
    status: number;
    constructor(message: string, status = 403) {
        super(message);
        this.status = status;
        this.name = "AuthorizationError";
    }
}

export function requireSession(session: Session | null) {
    if (!session?.user?.id) {
        throw new AuthorizationError("Unauthorized", 401);
    }
}

export function assertRole(session: Session | null, allowed: Role[]) {
    requireSession(session);
    const role = (session!.user as { role?: Role }).role ?? "VIEWER";
    if (!allowed.includes(role)) {
        throw new AuthorizationError("Forbidden", 403);
    }
    return role;
}

export function handleAuthError(error: unknown) {
    if (error instanceof AuthorizationError) {
        return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
}

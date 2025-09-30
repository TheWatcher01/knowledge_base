import type { Session } from "next-auth";
import { describe, expect, test } from "vitest";

import { AuthorizationError, assertRole } from "@/lib/authz";

function makeSession(overrides?: Partial<{ id: string; role?: "VIEWER" | "EDITOR" | "ADMIN" }>): Session {
    return {
        user: {
            id: "user-1",
            role: "EDITOR",
            ...overrides,
        },
        expires: "2030-01-01T00:00:00.000Z",
    } as Session;
}

describe("assertRole", () => {
    test("returns the user role when it is allowed", () => {
        const session = makeSession({ role: "ADMIN" });
        const role = assertRole(session, ["ADMIN", "EDITOR"]);

        expect(role).toBe("ADMIN");
    });

    test("throws AuthorizationError when session is missing", () => {
        try {
            assertRole(null, ["EDITOR"]);
            throw new Error("Expected assertRole to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(AuthorizationError);
            const authError = error as AuthorizationError;
            expect(authError.message).toBe("Unauthorized");
            expect(authError.status).toBe(401);
        }
    });

    test("throws AuthorizationError when user role is not allowed", () => {
        const session = makeSession({ role: "VIEWER" });

        try {
            assertRole(session, ["EDITOR", "ADMIN"]);
            throw new Error("Expected assertRole to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(AuthorizationError);
            const authError = error as AuthorizationError;
            expect(authError.message).toBe("Forbidden");
            expect(authError.status).toBe(403);
        }
    });

    test("falls back to VIEWER when the session has no explicit role", () => {
        const session = makeSession({ role: undefined });
        const role = assertRole(session, ["VIEWER", "ADMIN"]);

        expect(role).toBe("VIEWER");
    });
});

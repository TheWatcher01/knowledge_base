// Auth.js configuration

import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials?.email?.toLowerCase().trim();
                const password = credentials?.password || ""
                if (!email || !password) return null;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    console.warn("[auth] Credentials login failed: user not found", email);
                    return null;
                }

                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) {
                    console.warn("[auth] Credentials login failed: invalid password", email);
                    return null;
                }

                return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                if (token.id) session.user.id = token.id;
                session.user.role = token.role ?? session.user.role ?? null;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
};

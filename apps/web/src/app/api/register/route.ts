// Registration API route

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    const mail = String(email).toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: mail } });
    if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({ data: { email: mail, passwordHash, role: "VIEWER" } });

    return NextResponse.json({ ok: true });
}

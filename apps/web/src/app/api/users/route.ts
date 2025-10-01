import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { listUsers, createUser } from "@/lib/users";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const PaginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
    search: z.string().trim().optional(),
});

const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["VIEWER", "EDITOR", "ADMIN"]).default("VIEWER"),
});

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = PaginationSchema.safeParse(
        Object.fromEntries(request.nextUrl.searchParams),
    );

    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid query" }, { status: 400 });
    }

    try {
        const { users, total } = await listUsers(parsed.data);
        return NextResponse.json({ users, total });
    } catch (error) {
        console.error("[GET /api/users]", error);
        return NextResponse.json({ message: "Unable to fetch users" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    try {
        const user = await createUser(parsed.data);
        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }

        console.error("[POST /api/users]", error);
        return NextResponse.json({ message: "Unable to create user" }, { status: 500 });
    }
}

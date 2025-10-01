import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/users";
import { z } from "zod";

const UpdateUserSchema = z.object({
    role: z.enum(["VIEWER", "EDITOR", "ADMIN"]).optional(),
    disabled: z.boolean().optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    try {
        const user = await updateUser(id, parsed.data);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch (error) {
        console.error("[PATCH /api/users/:id]", error);
        return NextResponse.json({ message: "Unable to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.id === id) {
        return NextResponse.json({ message: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    try {
        const user = await deleteUser(id);
        return NextResponse.json({ user });
    } catch (error) {
        console.error("[DELETE /api/users/:id]", error);
        return NextResponse.json({ message: "Unable to delete user" }, { status: 500 });
    }
}

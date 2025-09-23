import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateKbForm } from "@/app/(app)/kb/_components/create-kb-form";
import { DeleteKbButton } from "@/app/(app)/kb/_components/delete-kb-button";

export default function KnowledgeBasesPage() {
    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Knowledge Bases</h1>
            <p className="text-muted-foreground">
                Start by creating or selecting a knowledge base.
            </p>
        </section>
    );
}

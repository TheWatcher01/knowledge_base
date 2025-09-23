import { prisma } from "@/lib/prisma";

export default async function FilesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const files = await prisma.document.findMany({
        where: { kbId: id, type: "file" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Files</h1>
                <p className="text-muted-foreground">
                    Manage the documents you associate with this knowledge base.
                </p>
            </header>

            <button
                type="button"
                className="btn-primary"
                disabled
                aria-disabled="true"
            >
                Add a file (feature coming soon)
            </button>

            {files.length === 0 ? (
                <p className="text-muted-foreground">
                    No files have been imported for this knowledge base yet.
                </p>
            ) : (
                <ul className="divide-y rounded border">
                    {files.map((file) => (
                        <li key={file.id} className="p-4">
                            <p className="font-medium">{file.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Added on {file.createdAt.toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

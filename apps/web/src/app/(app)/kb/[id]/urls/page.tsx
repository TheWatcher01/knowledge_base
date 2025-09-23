import { prisma } from "@/lib/prisma";

export default async function UrlsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const urls = await prisma.document.findMany({
        where: { kbId: id, type: "url" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">Web links</h1>
                <p className="text-muted-foreground">
                    Centralize useful online resources for your knowledge base here.
                </p>
            </header>

            <button
                type="button"
                className="btn-primary"
                disabled
                aria-disabled="true"
            >
                Add a URL (feature coming soon)
            </button>

            {urls.length === 0 ? (
                <p className="text-muted-foreground">
                    No links are associated with this knowledge base yet.
                </p>
            ) : (
                <ul className="space-y-3">
                    {urls.map((url) => (
                        <li key={url.id} className="rounded border p-4">
                            <p className="font-medium">{url.title ?? "Untitled"}</p>
                            {url.source && (
                                <a
                                    href={url.source}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 underline"
                                >
                                    Open link
                                </a>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Added on {url.createdAt.toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

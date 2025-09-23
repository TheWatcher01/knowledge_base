"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

const tabs = [
    { segment: undefined, label: "Vue d’ensemble", path: "" },
    { segment: "notes", label: "Notes", path: "notes" },
    { segment: "files", label: "Fichiers", path: "files" },
    { segment: "urls", label: "URLs", path: "urls" },
    { segment: "chat", label: "Chat", path: "chat" },
];

export function KnowledgeBaseTabs({ kbId }: { kbId: string }) {
    const segments = useSelectedLayoutSegments();
    const active = segments[1]; // segments[0] === "kb", segments[1] === sub-path 

    return (
        <nav className="border-b">
            <ul className="flex gap-4 text-sm font-medium">
                {tabs.map((tab) => {
                    const href = tab.path ? `/kb/${kbId}/${tab.path}` : `/kb/${kbId}`;
                    const isActive = active === tab.segment;
                    return (
                        <li key={tab.label}>
                            <Link
                                href={href}
                                className={`border-b-2 pb-3 transition-colors ${isActive
                                        ? "border-foreground text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

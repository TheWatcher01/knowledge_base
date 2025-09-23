// apps/web/src/lib/owui.ts

import { OWUI_BASE, OWUI_TOKEN } from "./config";

// Helper to call the Open Web UI API
export async function owuiJson(path: string, init?: RequestInit) {
    const res = await fetch(`${OWUI_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OWUI_TOKEN}`,
            ...(init?.headers || {}),
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const STATUS_MAP = new Map([
    ["queued", "queued"],
    ["processing", "processing"],
    ["synced", "synced"],
    ["error", "error"],
]);

async function main() {
    const entries = await prisma.urlEntry.findMany({
        include: {
            jobs: {
                orderBy: { queuedAt: "desc" },
                take: 1,
            },
        },
    });

    let updated = 0;
    let skipped = 0;

    for (const entry of entries) {
        const job = entry.jobs.at(0);
        if (!job) {
            skipped += 1;
            continue;
        }

        const nextStatus = STATUS_MAP.get(job.status) ?? null;
        if (!nextStatus || nextStatus === entry.status) {
            skipped += 1;
            continue;
        }

        if (dryRun) {
            console.log(`[dry-run] would update ${entry.id} from ${entry.status} -> ${nextStatus}`);
        } else {
            await prisma.urlEntry.update({
                where: { id: entry.id },
                data: { status: nextStatus },
            });
        }

        updated += 1;
    }

    console.log(`Processed ${entries.length} UrlEntry rows`);
    console.log(`Updated: ${updated}${dryRun ? " (dry-run)" : ""}`);
    console.log(`Skipped: ${skipped}`);
}

main()
    .catch((error) => {
        console.error("backfill-url-status failed", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

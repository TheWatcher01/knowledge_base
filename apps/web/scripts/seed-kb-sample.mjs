#!/usr/bin/env node

import { faker } from "@faker-js/faker";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const URL_FIXTURES = [
    {
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        title: "MDN JavaScript Guide",
        description: "Reference documentation for the JavaScript language, maintained by MDN.",
    },
    {
        url: "https://react.dev/learn",
        title: "React Learn",
        description: "Official interactive learning materials for React.",
    },
    {
        url: "https://nextjs.org/docs/app/building-your-application",
        title: "Next.js Application Guide",
        description: "Best practices for building applications with the Next.js App Router.",
    },
    {
        url: "https://beta.reactjs.org/apis",
        title: "React APIs",
        description: "Overview of the public APIs exposed by React.",
    },
    {
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS Docs",
        description: "Utility-first CSS framework reference and examples.",
    },
    {
        url: "https://www.prisma.io/docs/concepts/components/prisma-client",
        title: "Prisma Client",
        description: "Using the Prisma Client to query your database in TypeScript and JavaScript.",
    },
    {
        url: "https://vitest.dev/guide/",
        title: "Vitest Guide",
        description: "Fast unit testing powered by Vite – configuration and recipes.",
    },
    {
        url: "https://zod.dev/?id=basic-usage",
        title: "Zod Validation",
        description: "Schema declaration and validation with the Zod library.",
    },
    {
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        title: "TypeScript Handbook",
        description: "Core documentation and quick start for TypeScript developers.",
    },
    {
        url: "https://sonner.emilkowal.ski/",
        title: "Sonner Toasts",
        description: "Accessible toast notifications for React applications.",
    },
    {
        url: "https://lucide.dev/guide/",
        title: "Lucide Icons",
        description: "Guide to using Lucide icons in web projects.",
    },
    {
        url: "https://developer.chrome.com/docs/devtools",
        title: "Chrome DevTools",
        description: "Debugging, profiling, and auditing web applications with Chrome DevTools.",
    },
    {
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
        title: "Web Accessibility",
        description: "Best practices for building inclusive web experiences.",
    },
    {
        url: "https://www.w3.org/WAI/ARIA/apg/",
        title: "ARIA Authoring Practices",
        description: "Patterns and guidelines for designing accessible web components.",
    },
    {
        url: "https://vercel.com/docs/storage/vercel-postgres",
        title: "Vercel Postgres",
        description: "Managed PostgreSQL database on Vercel with connection guides.",
    },
    {
        url: "https://openai.com/research",
        title: "OpenAI Research",
        description: "Collection of research papers and blog posts from OpenAI.",
    },
];

let urlCursor = 0;
function pickUrlFixture() {
    const fixture = URL_FIXTURES[urlCursor % URL_FIXTURES.length];
    urlCursor += 1;
    return fixture;
}

function createDescription() {
    return faker.lorem.sentences({ min: 2, max: 4 });
}

function createContent() {
    return faker.lorem.paragraphs({ min: 1, max: 3, separator: "\n\n" });
}

function createTitle(words = 3) {
    return faker.word
        .words({ count: { min: words, max: words + 1 } })
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
}

async function ensureUser(email, role = Role.ADMIN) {
    const password = faker.internet.password({ length: 12, memorable: false });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: { role, passwordHash },
        create: {
            email,
            role,
            passwordHash,
            name: faker.person.fullName(),
        },
        include: { knowledgeBases: true },
    });
    return { user, password };
}

async function createKnowledgeBases(ownerId, count = 5) {
    const kbs = [];
    for (let i = 0; i < count; i++) {
        const kb = await prisma.knowledgeBase.create({
            data: {
                ownerId,
                name: createTitle(2),
                description: createDescription(),
            },
        });
        kbs.push(kb);
    }
    return kbs;
}

async function createNotes(kbId, count = 8) {
    for (let i = 0; i < count; i++) {
        await prisma.document.create({
            data: {
                kbId,
                title: createTitle(),
                type: "note",
                source: createContent(),
            },
        });
    }
}

async function createFiles(kbId, count = 3) {
    for (let i = 0; i < count; i++) {
        const document = await prisma.document.create({
            data: {
                kbId,
                title: createTitle(2),
                type: "file",
                source: faker.system.fileName({ extension: "txt" }),
            },
        });

        await prisma.fileAsset.create({
            data: {
                documentId: document.id,
                data: Buffer.from(createContent(), "utf8"),
                mimeType: "text/plain",
                size: faker.number.int({ min: 1_024, max: 25_600 }),
            },
        });
    }
}

async function createUrls(kbId, count = 4) {
    for (let i = 0; i < count; i++) {
        const fixture = pickUrlFixture();
        const document = await prisma.document.create({
            data: {
                kbId,
                title: fixture.title,
                type: "url",
                source: fixture.url,
            },
        });

        await prisma.urlEntry.create({
            data: {
                documentId: document.id,
                url: fixture.url,
                description: fixture.description ?? createDescription(),
                status: "synced",
            },
        });
    }
}

async function main() {
    const { user, password } = await ensureUser("demo@kb.local", Role.ADMIN);
    console.log(`Created demo user demo@kb.local / ${password}`);

    const kbs = await createKnowledgeBases(user.id, 6);
    console.log(`Seeded ${kbs.length} knowledge bases for demo user.`);

    for (const kb of kbs) {
        await Promise.all([
            createNotes(kb.id, faker.number.int({ min: 5, max: 9 })),
            createFiles(kb.id, faker.number.int({ min: 2, max: 4 })),
            createUrls(kb.id, faker.number.int({ min: 3, max: 6 })),
        ]);
        console.log(`  • ${kb.name}`);
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

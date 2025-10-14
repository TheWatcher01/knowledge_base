#!/usr/bin/env node

import bcrypt from "bcrypt";
import { PrismaClient, Role, UrlStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function ensureUser({ email, password, role, name }) {
  const passwordHash = await hashPassword(password);

  return prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      passwordHash,
      role,
      disabled: false,
      name,
    },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      name,
    },
  });
}

async function ensureKnowledgeBase({ ownerId, name, description }) {
  const existing = await prisma.knowledgeBase.findFirst({
    where: { ownerId, name },
  });
  if (existing) return existing;

  return prisma.knowledgeBase.create({
    data: {
      ownerId,
      name,
      description,
    },
  });
}

async function ensureNote({ kbId, title, content }) {
  const existing = await prisma.document.findFirst({
    where: { kbId, title, type: "note" },
  });
  if (existing) return existing;

  return prisma.document.create({
    data: {
      kbId,
      title,
      type: "note",
      source: content,
    },
  });
}

async function ensureFile({ kbId, title, fileName, mimeType, content }) {
  const existing = await prisma.document.findFirst({
    where: { kbId, title, type: "file" },
    include: { fileAsset: true },
  });

  if (existing && existing.fileAsset) {
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const document = existing ??
      (await tx.document.create({
        data: {
          kbId,
          title,
          type: "file",
          source: fileName,
        },
      }));

    const data = Buffer.from(content, "utf8");

    await tx.fileAsset.upsert({
      where: { documentId: document.id },
      update: {
        data,
        mimeType,
        size: data.length,
      },
      create: {
        documentId: document.id,
        data,
        mimeType,
        size: data.length,
      },
    });

    return document;
  });
}

async function ensureUrl({ kbId, title, url, description, status }) {
  const existing = await prisma.document.findFirst({
    where: { kbId, title, type: "url" },
    include: { urlEntry: true },
  });

  if (existing && existing.urlEntry) {
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const document = existing ??
      (await tx.document.create({
        data: {
          kbId,
          title,
          type: "url",
          source: url,
        },
      }));

    await tx.urlEntry.upsert({
      where: { documentId: document.id },
      update: {
        url,
        description,
        status,
      },
      create: {
        documentId: document.id,
        url,
        description,
        status,
      },
    });

    return document;
  });
}

async function provisionFixtures() {
  const fixtures = [
    {
      email: "admin@test.local",
      password: "Adm1n!234",
      role: Role.ADMIN,
      name: "Test Admin",
      kb: {
        name: "Admin Sandbox",
        description: "Knowledge base utilisée pour vérifier les permissions Admin.",
      },
    },
    {
      email: "editor@test.local",
      password: "Ed1tor!234",
      role: Role.EDITOR,
      name: "Test Editor",
      kb: {
        name: "Editor Playground",
        description: "Scénario de test pour les droits d'édition.",
      },
    },
    {
      email: "viewer@test.local",
      password: "V1ewer!234",
      role: Role.VIEWER,
      name: "Test Viewer",
      kb: {
        name: "Viewer Read Only",
        description: "Fixture de lecture pour les comptes Viewer.",
      },
    },
  ];

  for (const fixture of fixtures) {
    const user = await ensureUser(fixture);
    const kb = await ensureKnowledgeBase({
      ownerId: user.id,
      name: fixture.kb.name,
      description: fixture.kb.description,
    });

    await ensureNote({
      kbId: kb.id,
      title: "Workflow onboarding",
      content: "Cette note couvre les étapes à suivre pour vérifier l'accès aux onglets Notes/Fichiers/URLs.",
    });

    await ensureFile({
      kbId: kb.id,
      title: "Guide Permissions",
      fileName: "guide-permissions.txt",
      mimeType: "text/plain",
      content: "Ce fichier texte sert de support pour tester l'upload et la consultation de fichiers.",
    });

    await ensureUrl({
      kbId: kb.id,
      title: "Documentation interne",
      url: "https://example.com/internal-docs",
      description: "URL de référence pour tester la file d'attente d'ingestion.",
      status: UrlStatus.queued,
    });
  }

  return fixtures.map(({ email, password, role }) => ({ email, password, role }));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant. Définissez la variable d'environnement avant d'exécuter le seed.");
    process.exit(1);
  }

  const credentials = await provisionFixtures();
  console.log("Fixtures de test authz créées :\n");
  for (const cred of credentials) {
    console.log(`- ${cred.role}: ${cred.email} / ${cred.password}`);
  }
  console.log("\nCes comptes possèdent chacun 1 KB de démonstration avec une note, un fichier et une URL.");
}

main()
  .catch((error) => {
    console.error("Échec du seed des fixtures", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

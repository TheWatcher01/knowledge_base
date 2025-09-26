-- CreateEnum
CREATE TYPE "public"."UrlStatus" AS ENUM ('draft', 'queued', 'synced', 'error');

-- CreateTable
CREATE TABLE "public"."UrlEntry" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."UrlStatus" NOT NULL DEFAULT 'draft',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlEntry_documentId_key" ON "public"."UrlEntry"("documentId");

-- AddForeignKey
ALTER TABLE "public"."UrlEntry" ADD CONSTRAINT "UrlEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

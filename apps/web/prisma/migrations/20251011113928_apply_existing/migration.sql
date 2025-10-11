-- CreateTable
CREATE TABLE "UrlIngestionJob" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "UrlStatus" NOT NULL DEFAULT 'queued',
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UrlIngestionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UrlIngestionJob_documentId_idx" ON "UrlIngestionJob"("documentId");

-- AddForeignKey
ALTER TABLE "UrlIngestionJob" ADD CONSTRAINT "UrlIngestionJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "UrlEntry"("documentId") ON DELETE CASCADE ON UPDATE CASCADE;

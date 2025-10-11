-- CreateEnum
CREATE TYPE "ModelJobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "ModelJob" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "ModelJobStatus" NOT NULL DEFAULT 'queued',
    "summary" TEXT,
    "error" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModelJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelJob_provider_status_idx" ON "ModelJob"("provider", "status");

-- CreateIndex
CREATE INDEX "ModelJob_model_idx" ON "ModelJob"("model");

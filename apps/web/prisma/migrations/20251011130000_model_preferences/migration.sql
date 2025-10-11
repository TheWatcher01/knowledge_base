-- CreateTable
CREATE TABLE "ModelPreference" (
    "provider" TEXT NOT NULL,
    "chatModel" TEXT,
    "embeddingModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModelPreference_pkey" PRIMARY KEY ("provider")
);

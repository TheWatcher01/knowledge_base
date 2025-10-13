-- AlterEnum
ALTER TYPE "UrlStatus" ADD VALUE 'processing';

-- AlterTable
ALTER TABLE "ModelJob" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ModelPreference" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UrlIngestionJob" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "userAgent" TEXT;

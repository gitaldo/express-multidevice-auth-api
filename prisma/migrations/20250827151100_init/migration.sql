/*
  Warnings:

  - You are about to drop the column `lastLogin` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `RefreshToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "lastLogin",
DROP COLUMN "verified";

-- CreateTable
CREATE TABLE "public"."UserDevice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "os" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_deviceId_key" ON "public"."UserDevice"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "public"."UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

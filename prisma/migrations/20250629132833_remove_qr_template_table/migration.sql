/*
  Warnings:

  - You are about to drop the `access_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_action_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `error_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `qr_generation_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `qr_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "log_type" AS ENUM ('ACCESS', 'AUTH', 'AUDIT', 'ERROR', 'ADMIN', 'QR_GENERATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "log_level" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- DropForeignKey
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "admin_action_logs" DROP CONSTRAINT "admin_action_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth_logs" DROP CONSTRAINT "auth_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "error_logs" DROP CONSTRAINT "error_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "qr_generation_logs" DROP CONSTRAINT "qr_generation_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "qr_templates" DROP CONSTRAINT "qr_templates_userId_fkey";

-- DropTable
DROP TABLE "access_logs";

-- DropTable
DROP TABLE "admin_action_logs";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "auth_logs";

-- DropTable
DROP TABLE "error_logs";

-- DropTable
DROP TABLE "qr_generation_logs";

-- DropTable
DROP TABLE "qr_templates";

-- CreateTable
CREATE TABLE "application_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "log_type" NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT,
    "message" TEXT,
    "metadata" JSONB,
    "level" "log_level" NOT NULL DEFAULT 'INFO',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_logs_userId_createdAt_idx" ON "application_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "application_logs_type_createdAt_idx" ON "application_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "application_logs_level_createdAt_idx" ON "application_logs"("level", "createdAt");

-- CreateIndex
CREATE INDEX "application_logs_action_createdAt_idx" ON "application_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "application_logs_createdAt_idx" ON "application_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "application_logs" ADD CONSTRAINT "application_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

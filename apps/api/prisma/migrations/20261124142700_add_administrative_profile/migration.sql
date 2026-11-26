/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `user_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdministrativeSector" AS ENUM ('RECEPCAO', 'FATURAMENTO', 'FINANCEIRO', 'RH', 'SUPRIMENTOS');

-- CreateEnum
CREATE TYPE "WorkShift" AS ENUM ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'CLINICA';
ALTER TYPE "UserRole" ADD VALUE 'PACIENTE';
ALTER TYPE "UserRole" ADD VALUE 'ADMINISTRATIVO';
ALTER TYPE "UserRole" ADD VALUE 'SAUDE';
ALTER TYPE "UserRole" ADD VALUE 'ESTUDANTE';

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "administrative_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userProfileId" UUID NOT NULL,
    "sector" "AdministrativeSector" NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "registration" TEXT,
    "shift" "WorkShift" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrative_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrative_profiles_userProfileId_key" ON "administrative_profiles"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "administrative_profiles_registration_key" ON "administrative_profiles"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_cpf_key" ON "user_profiles"("cpf");

-- AddForeignKey
ALTER TABLE "administrative_profiles" ADD CONSTRAINT "administrative_profiles_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

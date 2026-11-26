CREATE TYPE "ClinicFacilityType" AS ENUM (
    'CLINICA_MEDICA',
    'CLINICA_ODONTOLOGICA',
    'LABORATORIO',
    'HOSPITAL',
    'POSTO_DE_SAUDE',
    'OUTRO'
);

CREATE TABLE "clinic_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userProfileId" UUID NOT NULL,
    "tradeName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cnes" TEXT,
    "facilityType" "ClinicFacilityType" NOT NULL,
    "specialties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_profiles_userProfileId_key" ON "clinic_profiles"("userProfileId");
CREATE UNIQUE INDEX "clinic_profiles_cnpj_key" ON "clinic_profiles"("cnpj");
CREATE UNIQUE INDEX "clinic_profiles_cnes_key" ON "clinic_profiles"("cnes");

ALTER TABLE "clinic_profiles"
ADD CONSTRAINT "clinic_profiles_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

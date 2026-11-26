ALTER TABLE "user_profiles"
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "street" TEXT,
ADD COLUMN "houseNumber" TEXT,
ADD COLUMN "addressComplement" TEXT,
ADD COLUMN "socialName" TEXT,
ADD COLUMN "requestedRole" "UserRole";

CREATE TABLE "health_professional_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userProfileId" UUID NOT NULL,
    "professionalCouncil" TEXT NOT NULL,
    "councilRegistration" TEXT NOT NULL,
    "specialties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_professional_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userProfileId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "academicRegistration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patient_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userProfileId" UUID NOT NULL,
    "cns" TEXT,
    "gender" TEXT,
    "race" TEXT,
    "bloodType" TEXT,
    "hasAllergies" TEXT,
    "allergies" TEXT,
    "healthConditions" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patient_profiles_userProfileId_key" ON "patient_profiles"("userProfileId");
CREATE UNIQUE INDEX "patient_profiles_cns_key" ON "patient_profiles"("cns");
CREATE UNIQUE INDEX "health_professional_profiles_userProfileId_key" ON "health_professional_profiles"("userProfileId");
CREATE UNIQUE INDEX "student_profiles_userProfileId_key" ON "student_profiles"("userProfileId");

ALTER TABLE "patient_profiles"
ADD CONSTRAINT "patient_profiles_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "health_professional_profiles"
ADD CONSTRAINT "health_professional_profiles_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_profiles"
ADD CONSTRAINT "student_profiles_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

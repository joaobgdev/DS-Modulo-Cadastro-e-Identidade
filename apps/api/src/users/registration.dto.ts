import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdministrativeSector,
  ClinicFacilityType,
  UserRole,
  WorkShift,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum RegistrationProfile {
  CLINICA = 'CLINICA',
  PACIENTE = 'PACIENTE',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  SAUDE = 'SAUDE',
  ESTUDANTE = 'ESTUDANTE',
}

export class CreateRegistrationDto {
  @ApiProperty({ enum: RegistrationProfile })
  @IsEnum(RegistrationProfile)
  profile!: RegistrationProfile;

  @ApiProperty({ example: 'Maria Silva', maxLength: 160 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 'maria@example.com', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: '2000-01-15', format: 'date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ example: '(81) 99999-9999', maxLength: 20 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '50000-000' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(8)
  postalCode!: string;

  @ApiProperty({ example: 'Rua das Flores', maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  street!: string;

  @ApiProperty({ example: '15', maxLength: 20 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  houseNumber!: string;

  @ApiPropertyOptional({ example: 'Apartamento 2', maxLength: 120 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? value.trim() : undefined,
  )
  @IsString()
  @MaxLength(120)
  addressComplement?: string;

  @ApiProperty({ minLength: 12, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ minLength: 12, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  confirmPassword!: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? value.trim() : undefined,
  )
  @IsString()
  @MaxLength(120)
  socialName?: string;

  @ApiPropertyOptional({ maxLength: 15 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(15)
  cns?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  race?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bloodType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  hasAllergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  healthConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  emergencyRelationship?: string;

  @ApiPropertyOptional({ enum: AdministrativeSector })
  @IsOptional()
  @IsEnum(AdministrativeSector)
  adminSector?: AdministrativeSector;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  adminRoleTitle?: string;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  adminRegistration?: string;

  @ApiPropertyOptional({ enum: WorkShift })
  @IsOptional()
  @IsEnum(WorkShift)
  adminShift?: WorkShift;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  clinicTradeName?: string;

  @ApiPropertyOptional({ example: '11222333000181' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @MaxLength(14)
  clinicCnpj?: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? value.replace(/\D/g, '') : undefined,
  )
  @IsString()
  @MaxLength(7)
  clinicCnes?: string;

  @ApiPropertyOptional({ enum: ClinicFacilityType })
  @IsOptional()
  @IsEnum(ClinicFacilityType)
  clinicFacilityType?: ClinicFacilityType;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  clinicSpecialties?: string;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  healthCouncil?: string;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  healthCouncilRegistration?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  healthSpecialties?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  studentInstitution?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  studentCourse?: string;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  studentRegistration?: string;
}

export class RegistrationResponseDto {
  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiPropertyOptional({ enum: UserRole, nullable: true })
  requestedRole!: UserRole | null;
}

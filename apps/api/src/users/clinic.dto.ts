import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicFacilityType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClinicUserDto {
  @ApiProperty({ example: 'Clínica Saúde Recife', minLength: 2, maxLength: 160 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Razão social deve ser um texto.' })
  @MinLength(2, { message: 'Razão social deve possuir entre 2 e 160 caracteres.' })
  @MaxLength(160, { message: 'Razão social deve possuir entre 2 e 160 caracteres.' })
  razaoSocial!: string;

  @ApiProperty({ example: 'Clínica Saúde', minLength: 2, maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Nome fantasia deve ser um texto.' })
  @MinLength(2, { message: 'Nome fantasia deve possuir entre 2 e 120 caracteres.' })
  @MaxLength(120, { message: 'Nome fantasia deve possuir entre 2 e 120 caracteres.' })
  nomeFantasia!: string;

  @ApiProperty({ example: '11222333000181', description: 'CNPJ com 14 dígitos, sem pontuação.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'CNPJ é obrigatório.' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 dígitos numéricos.' })
  cnpj!: string;

  @ApiPropertyOptional({ example: '1234567', description: 'CNES opcional com 7 dígitos.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' ? value.replace(/\D/g, '') : undefined,
  )
  @IsString({ message: 'CNES deve ser um texto.' })
  @Matches(/^\d{7}$/, { message: 'CNES deve conter 7 dígitos numéricos.' })
  cnes?: string;

  @ApiProperty({ enum: ClinicFacilityType, example: ClinicFacilityType.CLINICA_MEDICA })
  @IsEnum(ClinicFacilityType, { message: 'Selecione um tipo de estabelecimento válido.' })
  tipoEstabelecimento!: ClinicFacilityType;

  @ApiPropertyOptional({ example: 'Cardiologia, clínica geral', maxLength: 300 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Especialidades devem ser um texto.' })
  @MaxLength(300, { message: 'Especialidades devem possuir no máximo 300 caracteres.' })
  especialidades?: string;

  @ApiProperty({ example: '(81) 3333-4444', maxLength: 20 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Telefone é obrigatório.' })
  @MinLength(10, { message: 'Telefone inválido.' })
  @MaxLength(20, { message: 'Telefone inválido.' })
  telefone!: string;

  @ApiProperty({ example: 'contato@clinicasaude.com.br', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254, { message: 'E-mail inválido.' })
  email!: string;

  @ApiProperty({ example: 'Av. Recife, 100, Recife', minLength: 5, maxLength: 255 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Endereço completo é obrigatório.' })
  @MinLength(5, { message: 'Endereço deve possuir no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'Endereço deve possuir no máximo 255 caracteres.' })
  endereco!: string;
}

export class ClinicProfileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Clínica Saúde Recife' })
  razaoSocial!: string;

  @ApiProperty({ example: 'Clínica Saúde' })
  nomeFantasia!: string;

  @ApiProperty({ example: '11222333000181' })
  cnpj!: string;

  @ApiPropertyOptional({ example: '1234567', nullable: true })
  cnes!: string | null;

  @ApiProperty({ enum: ClinicFacilityType, example: ClinicFacilityType.CLINICA_MEDICA })
  tipoEstabelecimento!: ClinicFacilityType;

  @ApiPropertyOptional({ example: 'Cardiologia, clínica geral', nullable: true })
  especialidades!: string | null;

  @ApiProperty({ example: '(81) 3333-4444' })
  telefone!: string;

  @ApiProperty({ example: 'contato@clinicasaude.com.br' })
  email!: string;

  @ApiProperty({ example: 'Av. Recife, 100, Recife' })
  endereco!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-11-26T13:00:00.000Z' })
  createdAt!: string;
}

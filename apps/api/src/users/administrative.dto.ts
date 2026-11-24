import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdministrativeSector, WorkShift } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdministrativeUserDto {
  @ApiProperty({ example: 'Maria Silva', minLength: 2, maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Nome completo deve ser um texto.' })
  @MinLength(2, { message: 'Nome completo deve possuir entre 2 e 120 caracteres.' })
  @MaxLength(120, { message: 'Nome completo deve possuir entre 2 e 120 caracteres.' })
  nome!: string;

  @ApiProperty({ example: '000.000.000-00' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'CPF é obrigatório.' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos numéricos.' })
  cpf!: string;

  @ApiProperty({ example: '1995-05-20', description: 'Data de nascimento (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data de nascimento inválida.' })
  nascimento!: string;

  @ApiProperty({ example: '(81) 90000-0000' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Telefone é obrigatório.' })
  @MinLength(10, { message: 'Telefone inválido.' })
  @MaxLength(20, { message: 'Telefone inválido.' })
  telefone!: string;

  @ApiProperty({ example: 'maria.silva@clinica.ufpe.br', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254, { message: 'E-mail inválido.' })
  email!: string;

  @ApiProperty({ example: 'Av. Prof. Moraes Rego, 1235, Cidade Universitária, Recife' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Endereço completo é obrigatório.' })
  @MinLength(5, { message: 'Endereço deve possuir no mínimo 5 caracteres.' })
  @MaxLength(255, { message: 'Endereço deve possuir no máximo 255 caracteres.' })
  endereco!: string;

  @ApiProperty({ enum: AdministrativeSector, example: AdministrativeSector.RECEPCAO })
  @IsEnum(AdministrativeSector, {
    message: 'Setor deve ser RECEPCAO, FATURAMENTO, FINANCEIRO, RH ou SUPRIMENTOS.',
  })
  setor!: AdministrativeSector;

  @ApiProperty({ example: 'Assistente administrativo', minLength: 2, maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Cargo é obrigatório.' })
  @MinLength(2, { message: 'Cargo deve possuir entre 2 e 100 caracteres.' })
  @MaxLength(100, { message: 'Cargo deve possuir entre 2 e 100 caracteres.' })
  cargo!: string;

  @ApiPropertyOptional({ example: 'ADM-0421', maxLength: 30 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined,
  )
  @IsString({ message: 'Matrícula deve ser um texto.' })
  @MaxLength(30, { message: 'Matrícula deve possuir no máximo 30 caracteres.' })
  matricula?: string;

  @ApiProperty({ enum: WorkShift, example: WorkShift.MANHA })
  @IsEnum(WorkShift, { message: 'Turno deve ser MANHA, TARDE, NOITE ou INTEGRAL.' })
  turno!: WorkShift;
}

export class AdministrativeProfileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  nome!: string;

  @ApiProperty({ example: '00000000000' })
  cpf!: string;

  @ApiProperty({ example: '1995-05-20' })
  nascimento!: string;

  @ApiProperty({ example: '(81) 90000-0000' })
  telefone!: string;

  @ApiProperty({ example: 'maria.silva@clinica.ufpe.br' })
  email!: string;

  @ApiProperty({ example: 'Av. Prof. Moraes Rego, 1235, Recife' })
  endereco!: string;

  @ApiProperty({ enum: AdministrativeSector, example: AdministrativeSector.RECEPCAO })
  setor!: AdministrativeSector;

  @ApiProperty({ example: 'Assistente administrativo' })
  cargo!: string;

  @ApiPropertyOptional({ example: 'ADM-0421', nullable: true })
  matricula!: string | null;

  @ApiProperty({ enum: WorkShift, example: WorkShift.MANHA })
  turno!: WorkShift;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-11-24T13:00:00.000Z' })
  createdAt!: string;
}
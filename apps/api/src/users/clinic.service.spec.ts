import { BadRequestException, ConflictException } from '@nestjs/common';
import { ClinicFacilityType, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ClinicService, isValidCnpj } from './clinic.service';
import { KeycloakAdminService } from './keycloak-admin.service';

const clinicDto = {
  razaoSocial: 'Clínica Saúde Recife LTDA',
  nomeFantasia: 'Clínica Saúde',
  cnpj: '11222333000181',
  tipoEstabelecimento: ClinicFacilityType.CLINICA_MEDICA,
  especialidades: 'Cardiologia',
  telefone: '(81) 3333-4444',
  email: 'contato@clinicasaude.com.br',
  endereco: 'Av. Recife, 100, Recife',
};

describe('ClinicService', () => {
  const prisma = {
    userProfile: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    clinicProfile: {
      findFirst: vi.fn(),
    },
  };
  const keycloak = {
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  };
  const service = new ClinicService(prisma as unknown as PrismaService, keycloak as unknown as KeycloakAdminService);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('valida o dígito verificador do CNPJ e rejeita sequências repetidas', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('11222333000180')).toBe(false);
    expect(isValidCnpj('11111111111111')).toBe(false);
  });

  it('registra uma solicitação de clínica pendente sem liberar acesso profissional', async () => {
    prisma.userProfile.findFirst.mockResolvedValue(null);
    prisma.clinicProfile.findFirst.mockResolvedValue(null);
    keycloak.createUser.mockResolvedValue('keycloak-clinic-id');
    const createdAt = new Date('2026-11-26T13:00:00.000Z');
    prisma.userProfile.create.mockResolvedValue({
      id: 'clinic-profile-id',
      name: clinicDto.razaoSocial,
      email: clinicDto.email,
      phone: clinicDto.telefone,
      address: clinicDto.endereco,
      isActiveLocal: false,
      createdAt,
      clinicProfile: {
        tradeName: clinicDto.nomeFantasia,
        cnpj: clinicDto.cnpj,
        cnes: null,
        facilityType: ClinicFacilityType.CLINICA_MEDICA,
        specialties: clinicDto.especialidades,
      },
    });

    await expect(service.create(clinicDto)).resolves.toMatchObject({
      razaoSocial: clinicDto.razaoSocial,
      nomeFantasia: clinicDto.nomeFantasia,
      cnpj: clinicDto.cnpj,
      tipoEstabelecimento: ClinicFacilityType.CLINICA_MEDICA,
      email: clinicDto.email,
    });
    expect(keycloak.createUser).toHaveBeenCalledWith({
      name: clinicDto.nomeFantasia,
      email: clinicDto.email,
      role: UserRole.USER,
      enabled: false,
    });
    expect(prisma.userProfile.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: clinicDto.razaoSocial,
        roleSnapshot: UserRole.USER,
        requestedRole: UserRole.CLINICA,
        clinicProfile: {
          create: expect.objectContaining({ cnpj: clinicDto.cnpj }),
        },
      }),
    }));
  });

  it('rejeita CNPJ inválido antes de criar a identidade', async () => {
    await expect(service.create({ ...clinicDto, cnpj: '11222333000180' }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(keycloak.createUser).not.toHaveBeenCalled();
  });

  it('rejeita e-mail já cadastrado sem provisionar outra identidade', async () => {
    prisma.userProfile.findFirst.mockResolvedValue({ id: 'existing-profile' });
    await expect(service.create(clinicDto)).rejects.toBeInstanceOf(ConflictException);
    expect(keycloak.createUser).not.toHaveBeenCalled();
  });
});

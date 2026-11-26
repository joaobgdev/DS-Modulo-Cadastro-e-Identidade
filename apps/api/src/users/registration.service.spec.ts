import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { CreateRegistrationDto, RegistrationProfile } from './registration.dto';
import { RegistrationService } from './registration.service';

const credentials = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '(81) 99999-9999',
  postalCode: '50000000',
  street: 'Rua das Flores',
  houseNumber: '15',
  password: 'a-secure-password-123',
  confirmPassword: 'a-secure-password-123',
};

describe('RegistrationService', () => {
  const prisma = {
    userProfile: { findFirst: vi.fn(), create: vi.fn() },
    patientProfile: { findUnique: vi.fn() },
    clinicProfile: { findFirst: vi.fn() },
    administrativeProfile: { findUnique: vi.fn() },
  };
  const keycloak = { createUser: vi.fn(), deleteUser: vi.fn() };
  const service = new RegistrationService(
    prisma as unknown as PrismaService,
    keycloak as unknown as KeycloakAdminService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates an active patient account and persists patient data without storing credentials', async () => {
    const dto: CreateRegistrationDto = {
      ...credentials,
      profile: RegistrationProfile.PACIENTE,
      cpf: '52998224725',
      birthDate: '2000-01-15',
      cns: '123456789012345',
      gender: 'Mulher',
    };
    prisma.userProfile.findFirst.mockResolvedValue(null);
    prisma.patientProfile.findUnique.mockResolvedValue(null);
    keycloak.createUser.mockResolvedValue('kc-patient-id');
    prisma.userProfile.create.mockResolvedValue({
      isActiveLocal: true,
      roleSnapshot: UserRole.PACIENTE,
      requestedRole: null,
    });

    await expect(service.create(dto)).resolves.toEqual({
      isActive: true,
      role: UserRole.PACIENTE,
      requestedRole: null,
    });
    expect(keycloak.createUser).toHaveBeenCalledWith(expect.objectContaining({
      role: UserRole.PACIENTE,
      enabled: true,
      password: dto.password,
    }));
    const createInput = prisma.userProfile.create.mock.calls[0][0];
    expect(createInput.data.patientProfile.create).toMatchObject({
      cns: dto.cns,
      gender: 'Mulher',
    });
    expect(createInput.data).not.toHaveProperty('password');
    expect(createInput.data).not.toHaveProperty('confirmPassword');
  });

  it('creates professional accounts disabled with only the default role until approval', async () => {
    const dto: CreateRegistrationDto = {
      ...credentials,
      profile: RegistrationProfile.SAUDE,
      cpf: '52998224725',
      birthDate: '2000-01-15',
      healthCouncil: 'COREN',
      healthCouncilRegistration: '123456-PE',
      healthSpecialties: 'Enfermagem',
    };
    prisma.userProfile.findFirst.mockResolvedValue(null);
    keycloak.createUser.mockResolvedValue('kc-health-id');
    prisma.userProfile.create.mockResolvedValue({
      isActiveLocal: false,
      roleSnapshot: UserRole.USER,
      requestedRole: UserRole.SAUDE,
    });

    await expect(service.create(dto)).resolves.toEqual({
      isActive: false,
      role: UserRole.USER,
      requestedRole: UserRole.SAUDE,
    });
    expect(keycloak.createUser).toHaveBeenCalledWith(expect.objectContaining({
      role: UserRole.USER,
      enabled: false,
      password: dto.password,
    }));
    expect(prisma.userProfile.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        isActiveLocal: false,
        roleSnapshot: UserRole.USER,
        requestedRole: UserRole.SAUDE,
        healthProfessionalProfile: {
          create: {
            professionalCouncil: 'COREN',
            councilRegistration: '123456-PE',
            specialties: 'Enfermagem',
          },
        },
      }),
    }));
  });

  it('rejects mismatched passwords before provisioning an identity', async () => {
    await expect(service.create({
      ...credentials,
      profile: RegistrationProfile.PACIENTE,
      cpf: '52998224725',
      birthDate: '2000-01-15',
      cns: '123456789012345',
      confirmPassword: 'different-password',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(keycloak.createUser).not.toHaveBeenCalled();
    expect(prisma.userProfile.findFirst).not.toHaveBeenCalled();
  });
});

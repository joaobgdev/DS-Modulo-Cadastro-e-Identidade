import { ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakAdminService, type ProviderUserState } from './keycloak-admin.service';
import { UserService } from './user.service';

describe('UserService approval', () => {
  const prisma = {
    userProfile: { findUnique: vi.fn(), update: vi.fn() },
  };
  const keycloak = {
    getUserState: vi.fn(),
    updateUser: vi.fn(),
    setEnabled: vi.fn(),
    restoreUser: vi.fn(),
  };
  const service = new UserService(
    prisma as unknown as PrismaService,
    keycloak as unknown as KeycloakAdminService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('grants the requested role and enables access only after approval', async () => {
    const profile = {
      id: 'profile-id',
      keycloakUserId: 'keycloak-id',
      name: 'Ana Saúde',
      email: 'ana@example.com',
      cpf: null,
      birthDate: null,
      phone: null,
      address: null,
      postalCode: null,
      street: null,
      houseNumber: null,
      addressComplement: null,
      socialName: null,
      roleSnapshot: UserRole.USER,
      requestedRole: UserRole.SAUDE,
      isActiveLocal: false,
      createdAt: new Date('2026-11-26T12:00:00.000Z'),
      updatedAt: new Date('2026-11-26T12:00:00.000Z'),
    };
    const previous: ProviderUserState = {
      user: { id: 'keycloak-id', enabled: false },
      applicationRole: UserRole.USER,
    };
    prisma.userProfile.findUnique.mockResolvedValue(profile);
    keycloak.getUserState.mockResolvedValue(previous);
    keycloak.updateUser.mockResolvedValue(previous);
    keycloak.setEnabled.mockResolvedValue(previous);
    prisma.userProfile.update.mockResolvedValue({
      ...profile,
      roleSnapshot: UserRole.SAUDE,
      requestedRole: null,
      isActiveLocal: true,
    });

    await expect(service.approve(profile.id)).resolves.toMatchObject({
      role: UserRole.SAUDE,
      requestedRole: null,
      isActive: true,
    });
    expect(keycloak.updateUser).toHaveBeenCalledWith('keycloak-id', { role: UserRole.SAUDE });
    expect(keycloak.setEnabled).toHaveBeenCalledWith('keycloak-id', true);
    expect(prisma.userProfile.update).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        roleSnapshot: UserRole.SAUDE,
        requestedRole: null,
        isActiveLocal: true,
      },
    }));
  });

  it('does not let status changes activate an unapproved profile', async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      id: 'profile-id',
      keycloakUserId: 'keycloak-id',
      requestedRole: UserRole.CLINICA,
      isActiveLocal: false,
    });

    await expect(service.setActive('profile-id', true)).rejects.toBeInstanceOf(ConflictException);
    expect(keycloak.setEnabled).not.toHaveBeenCalled();
  });
});

import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  const prisma = { userProfile: { findUnique: vi.fn(), upsert: vi.fn() } };
  const sessions = { create: vi.fn() };
  const service = new AuthService(
    prisma as unknown as PrismaService,
    sessions as unknown as SessionService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('maps an approved Keycloak realm role to its application role', async () => {
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
      roleSnapshot: UserRole.SAUDE,
      requestedRole: null,
      isActiveLocal: true,
      createdAt: new Date('2026-11-26T12:00:00.000Z'),
      updatedAt: new Date('2026-11-26T12:00:00.000Z'),
    };
    prisma.userProfile.findUnique.mockResolvedValueOnce(profile).mockResolvedValueOnce(profile);
    prisma.userProfile.upsert.mockResolvedValue(profile);
    sessions.create.mockResolvedValue({
      token: 'session-token',
      expiresAt: new Date('2026-11-26T13:00:00.000Z'),
    });

    await expect(service.completeLogin({
      subject: 'keycloak-id',
      email: 'ana@example.com',
      name: 'Ana Saúde',
      roles: ['SAUDE'],
    })).resolves.toMatchObject({
      user: { role: UserRole.SAUDE },
    });
    expect(prisma.userProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ roleSnapshot: UserRole.SAUDE }),
    }));
  });
});

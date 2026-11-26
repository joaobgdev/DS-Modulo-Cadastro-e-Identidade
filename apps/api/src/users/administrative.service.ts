import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdministrativeProfileResponseDto,
  CreateAdministrativeUserDto,
} from './administrative.dto';
import { KeycloakAdminService } from './keycloak-admin.service';

@Injectable()
export class AdministrativeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async create(dto: CreateAdministrativeUserDto): Promise<AdministrativeProfileResponseDto> {
    const existing = await this.prisma.userProfile.findFirst({
      where: {
        OR: [{ email: dto.email }, { cpf: dto.cpf }],
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail ou CPF.');
    }

    if (dto.matricula) {
      const existingReg = await this.prisma.administrativeProfile.findUnique({
        where: { registration: dto.matricula },
      });
      if (existingReg) {
        throw new ConflictException('Já existe um profissional administrativo com esta matrícula.');
      }
    }

    const keycloakUserId = await this.keycloak.createUser({
      name: dto.nome,
      email: dto.email,
      role: UserRole.USER,
      enabled: false,
    });

    try {
      const created = await this.prisma.userProfile.create({
        data: {
          keycloakUserId,
          name: dto.nome,
          email: dto.email,
          cpf: dto.cpf,
          birthDate: new Date(`${dto.nascimento}T00:00:00.000Z`),
          phone: dto.telefone,
          address: dto.endereco,
          roleSnapshot: UserRole.USER,
          requestedRole: UserRole.ADMINISTRATIVO,
          isActiveLocal: false,
          administrativeProfile: {
            create: {
              sector: dto.setor,
              roleTitle: dto.cargo,
              registration: dto.matricula ?? null,
              shift: dto.turno,
            },
          },
        },
        include: {
          administrativeProfile: true,
        },
      });

      return this.toResponse(created);
    } catch (error) {
      await this.keycloak.deleteUser(keycloakUserId).catch(() => undefined);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Dados únicos (e-mail, CPF ou matrícula) já cadastrados.');
      }
      throw error;
    }
  }

  async findAll(): Promise<AdministrativeProfileResponseDto[]> {
    const profiles = await this.prisma.userProfile.findMany({
      where: {
        roleSnapshot: UserRole.ADMINISTRATIVO,
        administrativeProfile: { isNot: null },
      },
      include: { administrativeProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    return profiles.map((p) => this.toResponse(p));
  }

  async findById(id: string): Promise<AdministrativeProfileResponseDto> {
    const profile = await this.prisma.userProfile.findFirst({
      where: {
        id,
        roleSnapshot: UserRole.ADMINISTRATIVO,
        administrativeProfile: { isNot: null },
      },
      include: { administrativeProfile: true },
    });

    if (!profile) {
      throw new NotFoundException('Profissional administrativo não encontrado.');
    }

    return this.toResponse(profile);
  }

  private toResponse(
    user: Prisma.UserProfileGetPayload<{ include: { administrativeProfile: true } }>,
  ): AdministrativeProfileResponseDto {
    const admin = user.administrativeProfile!;
    return {
      id: user.id,
      nome: user.name,
      cpf: user.cpf ?? '',
      nascimento: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : '',
      telefone: user.phone ?? '',
      email: user.email,
      endereco: user.address ?? '',
      setor: admin.sector,
      cargo: admin.roleTitle,
      matricula: admin.registration,
      turno: admin.shift,
      isActive: user.isActiveLocal,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
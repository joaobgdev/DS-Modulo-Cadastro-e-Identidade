import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { ClinicProfileResponseDto, CreateClinicUserDto } from './clinic.dto';

export function isValidCnpj(value: string): boolean {
  const cnpj = value.replace(/\D/g, '');
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;

  const checkDigit = (base: string, weights: number[]) => {
    const sum = [...base].reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstDigit = checkDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = checkDigit(cnpj.slice(0, 12) + firstDigit, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

@Injectable()
export class ClinicService {
  private readonly logger = new Logger(ClinicService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async create(dto: CreateClinicUserDto): Promise<ClinicProfileResponseDto> {
    if (!isValidCnpj(dto.cnpj)) throw new BadRequestException('CNPJ inválido.');

    const existing = await this.prisma.userProfile.findFirst({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');

    const existingClinic = await this.prisma.clinicProfile.findFirst({
      where: { OR: [{ cnpj: dto.cnpj }, ...(dto.cnes ? [{ cnes: dto.cnes }] : [])] },
    });
    if (existingClinic) throw new ConflictException('Já existe uma clínica cadastrada com este CNPJ ou CNES.');

    const keycloakUserId = await this.keycloak.createUser({
      name: dto.nomeFantasia,
      email: dto.email,
      role: UserRole.USER,
      enabled: false,
    });

    try {
      const clinic = await this.prisma.userProfile.create({
        data: {
          keycloakUserId,
          name: dto.razaoSocial,
          email: dto.email,
          phone: dto.telefone,
          address: dto.endereco,
          roleSnapshot: UserRole.USER,
          requestedRole: UserRole.CLINICA,
          isActiveLocal: false,
          clinicProfile: {
            create: {
              tradeName: dto.nomeFantasia,
              cnpj: dto.cnpj,
              cnes: dto.cnes ?? null,
              facilityType: dto.tipoEstabelecimento,
              specialties: dto.especialidades || null,
            },
          },
        },
        include: { clinicProfile: true },
      });

      return this.toResponse(clinic);
    } catch (error) {
      try {
        await this.keycloak.deleteUser(keycloakUserId);
      } catch (compensationError) {
        this.logger.error(
          'Falha ao remover identidade recém-criada; reconciliação manual necessária.',
          compensationError instanceof Error ? compensationError.stack : undefined,
        );
        throw new ServiceUnavailableException(
          'O cadastro falhou e a identidade criada no Keycloak requer reconciliação manual.',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('E-mail, CNPJ ou CNES já cadastrado.');
      }
      throw error;
    }
  }

  private toResponse(
    user: Prisma.UserProfileGetPayload<{ include: { clinicProfile: true } }>,
  ): ClinicProfileResponseDto {
    const clinic = user.clinicProfile!;
    return {
      id: user.id,
      razaoSocial: user.name,
      nomeFantasia: clinic.tradeName,
      cnpj: clinic.cnpj,
      cnes: clinic.cnes,
      tipoEstabelecimento: clinic.facilityType,
      especialidades: clinic.specialties,
      telefone: user.phone ?? '',
      email: user.email,
      endereco: user.address ?? '',
      isActive: user.isActiveLocal,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

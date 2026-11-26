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
import { isValidCnpj } from './clinic.service';
import { CreateRegistrationDto, RegistrationProfile } from './registration.dto';

const isPhone = (value: string) => /^\d{10,11}$/.test(value.replace(/\D/g, ''));

function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (base: string, factor: number) => {
    const remainder = [...base].reduce(
      (sum, current, index) => sum + Number(current) * (factor - index),
      0,
    ) % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const first = digit(cpf.slice(0, 9), 10);
  const second = digit(`${cpf.slice(0, 9)}${first}`, 11);
  return cpf.endsWith(`${first}${second}`);
}

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async create(dto: CreateRegistrationDto) {
    const isPatient = dto.profile === RegistrationProfile.PACIENTE;
    this.validate(dto);
    await this.assertUnique(dto);

    const requestedRole = isPatient ? null : this.roleFor(dto.profile);
    const role = isPatient ? UserRole.PACIENTE : UserRole.USER;
    const isActive = isPatient;
    const address = [
      dto.street,
      dto.houseNumber,
      dto.addressComplement,
      `CEP ${dto.postalCode}`,
    ].filter(Boolean).join(', ');

    const keycloakUserId = await this.keycloak.createUser({
      name: dto.profile === RegistrationProfile.CLINICA
        ? dto.clinicTradeName!.trim()
        : dto.name.trim(),
      email: dto.email,
      role,
      password: dto.password,
      enabled: isActive,
    });

    try {
      const profile = await this.prisma.userProfile.create({
        data: {
          keycloakUserId,
          name: dto.name.trim(),
          email: dto.email,
          cpf: dto.cpf || null,
          birthDate: dto.birthDate ? new Date(`${dto.birthDate}T00:00:00.000Z`) : null,
          phone: dto.phone.trim(),
          address,
          postalCode: dto.postalCode,
          street: dto.street.trim(),
          houseNumber: dto.houseNumber.trim(),
          addressComplement: dto.addressComplement ?? null,
          socialName: dto.socialName ?? null,
          roleSnapshot: role,
          requestedRole,
          isActiveLocal: isActive,
          ...(dto.profile === RegistrationProfile.CLINICA ? {
            clinicProfile: {
              create: {
                tradeName: dto.clinicTradeName!.trim(),
                cnpj: dto.clinicCnpj!,
                cnes: dto.clinicCnes ?? null,
                facilityType: dto.clinicFacilityType!,
                specialties: dto.clinicSpecialties?.trim() || null,
              },
            },
          } : {}),
          ...(dto.profile === RegistrationProfile.ADMINISTRATIVO ? {
            administrativeProfile: {
              create: {
                sector: dto.adminSector!,
                roleTitle: dto.adminRoleTitle!.trim(),
                registration: dto.adminRegistration?.trim() || null,
                shift: dto.adminShift!,
              },
            },
          } : {}),
          ...(dto.profile === RegistrationProfile.SAUDE ? {
            healthProfessionalProfile: {
              create: {
                professionalCouncil: dto.healthCouncil!,
                councilRegistration: dto.healthCouncilRegistration!.trim(),
                specialties: dto.healthSpecialties?.trim() || null,
              },
            },
          } : {}),
          ...(dto.profile === RegistrationProfile.ESTUDANTE ? {
            studentProfile: {
              create: {
                institution: dto.studentInstitution!.trim(),
                course: dto.studentCourse!.trim(),
                academicRegistration: dto.studentRegistration!.trim(),
              },
            },
          } : {}),
          ...(isPatient ? {
            patientProfile: {
              create: {
                cns: dto.cns!,
                gender: dto.gender ?? null,
                race: dto.race ?? null,
                bloodType: dto.bloodType ?? null,
                hasAllergies: dto.hasAllergies ?? null,
                allergies: dto.allergies?.trim() || null,
                healthConditions: dto.healthConditions?.trim() || null,
                emergencyName: dto.emergencyName?.trim() || null,
                emergencyPhone: dto.emergencyPhone?.trim() || null,
                emergencyRelationship: dto.emergencyRelationship ?? null,
              },
            },
          } : {}),
        },
      });

      return {
        isActive: profile.isActiveLocal,
        role: profile.roleSnapshot,
        requestedRole: profile.requestedRole,
      };
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
        throw new ConflictException('E-mail, documento ou identificador institucional já cadastrado.');
      }
      throw error;
    }
  }

  private validate(dto: CreateRegistrationDto): void {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('A senha e a confirmação de senha não coincidem.');
    }
    if (!isPhone(dto.phone)) {
      throw new BadRequestException('Informe um telefone com DDD e 10 ou 11 dígitos.');
    }
    if (!/^\d{8}$/.test(dto.postalCode)) {
      throw new BadRequestException('Informe um CEP com 8 dígitos.');
    }
    if (dto.profile !== RegistrationProfile.CLINICA && dto.name.length > 120) {
      throw new BadRequestException('Nome deve possuir no máximo 120 caracteres.');
    }
    if (dto.profile !== RegistrationProfile.CLINICA) {
      if (!dto.cpf || !isValidCpf(dto.cpf)) throw new BadRequestException('Informe um CPF válido.');
      if (!dto.birthDate || new Date(`${dto.birthDate}T00:00:00.000Z`) > new Date()) {
        throw new BadRequestException('Informe uma data de nascimento válida que não esteja no futuro.');
      }
    }
    if (dto.profile === RegistrationProfile.PACIENTE) {
      if (!dto.cns || !/^\d{15}$/.test(dto.cns)) {
        throw new BadRequestException('Informe os 15 dígitos do Cartão SUS.');
      }
      if (!dto.emergencyName && (dto.emergencyPhone || dto.emergencyRelationship)) {
        throw new BadRequestException('Preencha todos os dados do contato de emergência.');
      }
      if (dto.emergencyName && (
        dto.emergencyName.trim().split(/\s+/).length < 2 ||
        !dto.emergencyPhone ||
        !isPhone(dto.emergencyPhone) ||
        !dto.emergencyRelationship
      )) {
        throw new BadRequestException('Preencha nome, telefone e relação do contato de emergência.');
      }
    }
    if (dto.profile === RegistrationProfile.CLINICA) {
      if (!dto.clinicTradeName?.trim() || dto.clinicTradeName.length < 2) {
        throw new BadRequestException('Informe o nome fantasia da clínica.');
      }
      if (!dto.clinicCnpj || !isValidCnpj(dto.clinicCnpj)) {
        throw new BadRequestException('Informe um CNPJ válido.');
      }
      if (!dto.clinicFacilityType) {
        throw new BadRequestException('Selecione o tipo de estabelecimento.');
      }
      if (dto.clinicCnes && !/^\d{7}$/.test(dto.clinicCnes)) {
        throw new BadRequestException('CNES deve conter 7 dígitos.');
      }
    }
    if (dto.profile === RegistrationProfile.ADMINISTRATIVO && (
      !dto.adminSector || (dto.adminRoleTitle?.trim().length ?? 0) < 2 || !dto.adminShift
    )) {
      throw new BadRequestException('Informe o setor, cargo e turno do profissional administrativo.');
    }
    if (dto.profile === RegistrationProfile.SAUDE && (
      !dto.healthCouncil?.trim() || !dto.healthCouncilRegistration?.trim()
    )) {
      throw new BadRequestException('Informe o conselho profissional e o número de registro.');
    }
    if (dto.profile === RegistrationProfile.ESTUDANTE && (
      !dto.studentInstitution?.trim() || !dto.studentCourse?.trim() || !dto.studentRegistration?.trim()
    )) {
      throw new BadRequestException('Informe a instituição de ensino, o curso e a matrícula acadêmica.');
    }
  }

  private async assertUnique(dto: CreateRegistrationDto): Promise<void> {
    const existing = await this.prisma.userProfile.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.cpf ? [{ cpf: dto.cpf }] : []),
        ],
      },
    });
    if (existing) throw new ConflictException('Já existe um cadastro com este e-mail ou CPF.');

    if (dto.profile === RegistrationProfile.CLINICA) {
      const clinic = await this.prisma.clinicProfile.findFirst({
        where: {
          OR: [
            { cnpj: dto.clinicCnpj! },
            ...(dto.clinicCnes ? [{ cnes: dto.clinicCnes }] : []),
          ],
        },
      });
      if (clinic) throw new ConflictException('Já existe uma clínica com este CNPJ ou CNES.');
    }
    if (dto.profile === RegistrationProfile.PACIENTE && dto.cns) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { cns: dto.cns } });
      if (patient) throw new ConflictException('Já existe um paciente com este Cartão SUS.');
    }
    if (dto.profile === RegistrationProfile.ADMINISTRATIVO && dto.adminRegistration) {
      const administrative = await this.prisma.administrativeProfile.findUnique({
        where: { registration: dto.adminRegistration },
      });
      if (administrative) throw new ConflictException('Já existe um profissional com esta matrícula.');
    }
  }

  private roleFor(profile: RegistrationProfile): UserRole {
    switch (profile) {
      case RegistrationProfile.CLINICA: return UserRole.CLINICA;
      case RegistrationProfile.ADMINISTRATIVO: return UserRole.ADMINISTRATIVO;
      case RegistrationProfile.SAUDE: return UserRole.SAUDE;
      case RegistrationProfile.ESTUDANTE: return UserRole.ESTUDANTE;
      case RegistrationProfile.PACIENTE: return UserRole.PACIENTE;
    }
  }
}

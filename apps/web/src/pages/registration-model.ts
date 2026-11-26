import { z } from 'zod';
import {
  CreateAdministrativeUserDtoSetor,
  CreateAdministrativeUserDtoTurno,
} from '../lib/api-client/models';

export const registrationProfiles = [
  { id: 'patient', label: 'Paciente', description: 'Para quem vai fazer consultas, exames ou receber atendimento na clínica.' },
  { id: 'clinic', label: 'Clínica', description: 'Para cadastrar um estabelecimento de saúde.' },
  { id: 'administrative', label: 'Profissional administrativo', description: 'Para quem atua na administração e no atendimento da clínica.' },
  { id: 'health', label: 'Profissional de saúde', description: 'Para quem presta cuidados e atendimento em saúde.' },
  { id: 'student', label: 'Estudante / Estagiário', description: 'Para estudantes e estagiários vinculados à clínica.' },
] as const;

export type RegistrationProfile = typeof registrationProfiles[number]['id'];

const digits = (value: string) => value.replace(/\D/g, '');
const isPhone = (value: string) => /^[\d\s()+-]+$/.test(value) && /^\d{10,11}$/.test(digits(value));

export const genderOptions = ['Mulher', 'Homem', 'Pessoa não binária', 'Outra identidade de gênero', 'Prefiro não informar'] as const;
export const raceOptions = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Prefiro não informar'] as const;
export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sei'] as const;
export const allergyOptions = ['Sim', 'Não', 'Não sei'] as const;
export const emergencyRelationships = [
  'Mãe', 'Pai', 'Cônjuge/companheiro(a)', 'Filho(a)', 'Irmão/irmã', 'Responsável legal', 'Amigo(a)', 'Outro',
] as const;

export const administrativeSectors = [
  { value: CreateAdministrativeUserDtoSetor.RECEPCAO, label: 'Recepção / Atendimento' },
  { value: CreateAdministrativeUserDtoSetor.FATURAMENTO, label: 'Faturamento' },
  { value: CreateAdministrativeUserDtoSetor.FINANCEIRO, label: 'Financeiro' },
  { value: CreateAdministrativeUserDtoSetor.RH, label: 'Recursos Humanos (RH)' },
  { value: CreateAdministrativeUserDtoSetor.SUPRIMENTOS, label: 'Suprimentos' },
] as const;

export const administrativeShifts = [
  { value: CreateAdministrativeUserDtoTurno.MANHA, label: 'Manhã' },
  { value: CreateAdministrativeUserDtoTurno.TARDE, label: 'Tarde' },
  { value: CreateAdministrativeUserDtoTurno.NOITE, label: 'Noite' },
  { value: CreateAdministrativeUserDtoTurno.INTEGRAL, label: 'Integral' },
] as const;

export const administrativeSpecificFields = ['adminSector', 'adminRoleTitle', 'adminRegistration', 'adminShift'] as const;
export const clinicSpecificFields = ['clinicCnpj', 'clinicTradeName', 'clinicCnes', 'clinicFacilityType', 'clinicSpecialties'] as const;
export const healthSpecificFields = ['healthCouncil', 'healthCouncilRegistration', 'healthSpecialties'] as const;
export const studentSpecificFields = ['studentInstitution', 'studentCourse', 'studentRegistration'] as const;
export const emergencyFields = ['emergencyName', 'emergencyPhone', 'emergencyRelationship'] as const;
export const clinicFacilityTypes = [
  { value: 'CLINICA_MEDICA', label: 'Clínica médica' },
  { value: 'CLINICA_ODONTOLOGICA', label: 'Clínica odontológica' },
  { value: 'LABORATORIO', label: 'Laboratório' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'POSTO_DE_SAUDE', label: 'Posto de saúde' },
  { value: 'OUTRO', label: 'Outro estabelecimento de saúde' },
] as const;

export function formatCpf(value: string) {
  return digits(value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');
}

export function formatCep(value: string) {
  return digits(value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

export function formatPhone(value: string) {
  const number = digits(value).slice(0, 11);
  if (!number) return '';
  if (number.length < 3) return `(${number}`;

  const split = number.length === 11 ? 7 : 6;
  const suffix = number.slice(split);
  return `(${number.slice(0, 2)}) ${number.slice(2, split)}${suffix ? `-${suffix}` : ''}`;
}

export function formatCns(value: string) {
  const number = digits(value).slice(0, 15);
  return [number.slice(0, 3), number.slice(3, 7), number.slice(7, 11), number.slice(11)]
    .filter(Boolean).join(' ');
}

export function formatCnpj(value: string) {
  return digits(value).slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
    .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, '$1-$2');
}

function isValidCnpj(value: string) {
  const cnpj = digits(value);
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digit = (base: string, weights: number[]) => {
    const sum = [...base].reduce((total, current, index) => total + Number(current) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const first = digit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = digit(`${cnpj.slice(0, 12)}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${first}${second}`);
}

export const basicDataSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo.').max(120, 'Use no máximo 120 caracteres.'),
  cpf: z.string().trim().min(1, 'Informe o CPF.').refine(
    value => /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(value),
    'Informe um CPF com 11 dígitos (000.000.000-00).',
  ),
  birthDate: z.string().min(1, 'Informe a data de nascimento.').refine(value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date <= new Date()
      && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value;
  }, 'Informe uma data válida que não esteja no futuro.'),
  phone: z.string().trim().min(1, 'Informe o telefone.').refine(
    isPhone,
    'Informe um telefone com DDD e 10 ou 11 dígitos.',
  ),
  email: z.string().trim().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  address: z.string().trim().min(1, 'Informe o endereço completo.').max(300, 'Use no máximo 300 caracteres.'),
  usesSocialName: z.enum(['', 'yes', 'no', 'undisclosed']),
  socialName: z.string().trim().max(120, 'Use no máximo 120 caracteres.'),
});

const teamDataSchema = basicDataSchema.extend({
  address: z.string(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'Informe um CEP com 8 dígitos.'),
  street: z.string().trim().min(1, 'Informe a rua.'),
  houseNumber: z.string().trim().min(1, 'Informe o número ou digite S/N.'),
  complement: z.string().trim(),
  password: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres.').max(128, 'A senha deve ter no máximo 128 caracteres.'),
  confirmPassword: z.string().min(1, 'Confirme sua senha.').max(128, 'A confirmação deve ter no máximo 128 caracteres.'),
  cns: z.string(),
  gender: z.string(),
  race: z.string(),
  bloodType: z.string(),
  hasAllergies: z.string(),
  allergies: z.string(),
  healthConditions: z.string(),
  emergencyName: z.string(),
  emergencyPhone: z.string(),
  emergencyRelationship: z.string(),
  adminSector: z.string(),
  adminRoleTitle: z.string(),
  adminRegistration: z.string(),
  adminShift: z.string(),
  clinicTradeName: z.string(),
  clinicCnpj: z.string(),
  clinicCnes: z.string(),
  clinicFacilityType: z.string(),
  clinicSpecialties: z.string(),
  healthCouncil: z.string(),
  healthCouncilRegistration: z.string(),
  healthSpecialties: z.string(),
  studentInstitution: z.string(),
  studentCourse: z.string(),
  studentRegistration: z.string(),
});

const administrativeDataSchema = teamDataSchema.extend({
  adminSector: z.enum(
    [
      CreateAdministrativeUserDtoSetor.RECEPCAO,
      CreateAdministrativeUserDtoSetor.FATURAMENTO,
      CreateAdministrativeUserDtoSetor.FINANCEIRO,
      CreateAdministrativeUserDtoSetor.RH,
      CreateAdministrativeUserDtoSetor.SUPRIMENTOS,
    ],
    { message: 'Selecione o setor de atuação.' },
  ),
  adminRoleTitle: z.string().trim().min(2, 'Informe o cargo (mínimo 2 caracteres).').max(100, 'Use no máximo 100 caracteres.'),
  adminRegistration: z.string().trim().max(30, 'Use no máximo 30 caracteres.'),
  adminShift: z.enum(
    [
      CreateAdministrativeUserDtoTurno.MANHA,
      CreateAdministrativeUserDtoTurno.TARDE,
      CreateAdministrativeUserDtoTurno.NOITE,
      CreateAdministrativeUserDtoTurno.INTEGRAL,
    ],
    { message: 'Selecione o turno de trabalho.' },
  ),
});

const clinicDataSchema = teamDataSchema.extend({
  name: z.string().trim().min(2, 'Informe a razão social.').max(160, 'Use no máximo 160 caracteres.'),
  cpf: z.string(),
  birthDate: z.string(),
  clinicTradeName: z.string().trim().min(2, 'Informe o nome fantasia.').max(120, 'Use no máximo 120 caracteres.'),
  clinicCnpj: z.string().refine(isValidCnpj, 'Informe um CNPJ válido com 14 dígitos.'),
  clinicCnes: z.string().refine(value => !value || /^\d{7}$/.test(digits(value)), 'Informe um CNES com 7 dígitos.'),
  clinicFacilityType: z.enum(
    ['CLINICA_MEDICA', 'CLINICA_ODONTOLOGICA', 'LABORATORIO', 'HOSPITAL', 'POSTO_DE_SAUDE', 'OUTRO'],
    { message: 'Selecione o tipo de estabelecimento.' },
  ),
  clinicSpecialties: z.string().trim().max(300, 'Use no máximo 300 caracteres.'),
});

const healthDataSchema = teamDataSchema.extend({
  healthCouncil: z.string().trim().min(2, 'Informe o conselho profissional.').max(40),
  healthCouncilRegistration: z.string().trim().min(2, 'Informe o número do registro profissional.').max(40),
  healthSpecialties: z.string().trim().max(300, 'Use no máximo 300 caracteres.'),
});

const studentDataSchema = teamDataSchema.extend({
  studentInstitution: z.string().trim().min(2, 'Informe a instituição de ensino.').max(160),
  studentCourse: z.string().trim().min(2, 'Informe o curso.').max(120),
  studentRegistration: z.string().trim().min(2, 'Informe a matrícula acadêmica.').max(40),
});

const optionalChoice = (options: readonly [string, ...string[]]) =>
  z.enum(options, 'Selecione uma opção válida.').or(z.literal(''));

const patientDataSchema = teamDataSchema.extend({
  address: z.string(),
  cns: z.string().refine(
    value => /^\d{15}$/.test(value.replace(/ /g, '')),
    'Informe os 15 dígitos do Cartão SUS.',
  ),
  gender: optionalChoice(genderOptions),
  race: optionalChoice(raceOptions),
  bloodType: optionalChoice(bloodTypes),
  hasAllergies: optionalChoice(allergyOptions),
  allergies: z.string().trim(),
  healthConditions: z.string().trim(),
  emergencyName: z.string().trim(),
  emergencyPhone: z.string().trim(),
  emergencyRelationship: optionalChoice(emergencyRelationships),
}).superRefine((data, context) => {
  if (!emergencyFields.some(field => data[field])) return;

  if (data.emergencyName.split(/\s+/).length < 2) {
    context.addIssue({ code: 'custom', path: ['emergencyName'], message: 'Informe o nome e o sobrenome do contato.' });
  }
  if (!isPhone(data.emergencyPhone)) {
    context.addIssue({ code: 'custom', path: ['emergencyPhone'], message: 'Informe o telefone do contato com DDD e 10 ou 11 dígitos.' });
  }
  if (!data.emergencyRelationship) {
    context.addIssue({ code: 'custom', path: ['emergencyRelationship'], message: 'Selecione a relação do contato com o paciente.' });
  }
});

function withPasswordConfirmation<T extends z.ZodType<{ password: string; confirmPassword: string }>>(schema: T) {
  return schema.superRefine((data, context) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'A confirmação de senha não corresponde.',
      });
    }
  });
}

export const registrationSchema = (profile: RegistrationProfile | null) => {
  if (profile === 'patient') return withPasswordConfirmation(patientDataSchema);
  if (profile === 'administrative') return withPasswordConfirmation(administrativeDataSchema);
  if (profile === 'clinic') return withPasswordConfirmation(clinicDataSchema);
  if (profile === 'health') return withPasswordConfirmation(healthDataSchema);
  if (profile === 'student') return withPasswordConfirmation(studentDataSchema);
  return withPasswordConfirmation(teamDataSchema);
};

export type BasicData = z.infer<typeof teamDataSchema>;
export const emptyBasicData: BasicData = {
  name: '', cpf: '', birthDate: '', phone: '', email: '', address: '',
  cep: '', street: '', houseNumber: '', complement: '', password: '', confirmPassword: '', cns: '',
  usesSocialName: '', socialName: '',
  gender: '', race: '', bloodType: '', hasAllergies: '', allergies: '', healthConditions: '',
  emergencyName: '', emergencyPhone: '', emergencyRelationship: '',
  adminSector: '', adminRoleTitle: '', adminRegistration: '', adminShift: '',
  clinicTradeName: '', clinicCnpj: '', clinicCnes: '', clinicFacilityType: '', clinicSpecialties: '',
  healthCouncil: '', healthCouncilRegistration: '', healthSpecialties: '',
  studentInstitution: '', studentCourse: '', studentRegistration: '',
};
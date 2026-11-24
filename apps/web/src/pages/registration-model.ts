import { z } from 'zod';

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

export const emergencyFields = ['emergencyName', 'emergencyPhone', 'emergencyRelationship'] as const;

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

// Nesta etapa validamos o formato; a regra de dígitos verificadores é KAN-105.
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
  cep: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  complement: z.string(),
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
});

const optionalChoice = (options: readonly [string, ...string[]]) =>
  z.enum(options, 'Selecione uma opção válida.').or(z.literal(''));

const patientDataSchema = teamDataSchema.extend({
  address: z.string(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'Informe um CEP com 8 dígitos.'),
  street: z.string().trim().min(1, 'Informe a rua.'),
  houseNumber: z.string().trim().min(1, 'Informe o número ou digite S/N.'),
  complement: z.string().trim(),
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

export const registrationSchema = (profile: RegistrationProfile | null) =>
  profile === 'patient' ? patientDataSchema : teamDataSchema;

export type BasicData = z.infer<typeof teamDataSchema>;
export const emptyBasicData: BasicData = {
  name: '', cpf: '', birthDate: '', phone: '', email: '', address: '',
  cep: '', street: '', houseNumber: '', complement: '', cns: '',
  usesSocialName: '', socialName: '',
  gender: '', race: '', bloodType: '', hasAllergies: '', allergies: '', healthConditions: '',
  emergencyName: '', emergencyPhone: '', emergencyRelationship: '',
};

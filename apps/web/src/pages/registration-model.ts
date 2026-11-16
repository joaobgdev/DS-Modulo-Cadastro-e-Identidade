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
    value => /^[\d\s()+-]+$/.test(value) && /^\d{10,11}$/.test(digits(value)),
    'Informe um telefone com DDD e 10 ou 11 dígitos.',
  ),
  email: z.string().trim().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  address: z.string().trim().min(1, 'Informe o endereço completo.').max(300, 'Use no máximo 300 caracteres.'),
  usesSocialName: z.enum(['', 'yes', 'no', 'undisclosed']),
  socialName: z.string().trim().max(120, 'Use no máximo 120 caracteres.'),
});

export type BasicData = z.infer<typeof basicDataSchema>;
export const emptyBasicData: BasicData = {
  name: '', cpf: '', birthDate: '', phone: '', email: '', address: '',
  usesSocialName: '', socialName: '',
};

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Building2, Check, CircleHelp, GraduationCap, Stethoscope, User, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { administrativeControllerCreate } from '../lib/api-client';
import type { CreateAdministrativeUserDtoSetor, CreateAdministrativeUserDtoTurno } from '../lib/api-client/models';
import {
  administrativeSectors,
  administrativeShifts,
  administrativeSpecificFields,
  allergyOptions,
  bloodTypes,
  emergencyFields,
  emergencyRelationships,
  emptyBasicData,
  formatCep,
  formatCns,
  formatCpf,
  formatPhone,
  genderOptions,
  raceOptions,
  registrationProfiles,
  registrationSchema,
  type BasicData,
  type RegistrationProfile,
} from './registration-model';
import { usePatientAddress } from './use-patient-address';

const steps = ['Seleção', 'Dados básicos', 'Específicos', 'Revisão'];
const stepDescriptions = ['Seleção de perfil', 'Informações iniciais', 'Dados do perfil', 'Confira seus dados'];
const icons = { patient: User, clinic: Building2, administrative: Users, health: Stethoscope, student: GraduationCap };
const answers = [{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }, { value: 'undisclosed', label: 'Prefiro não informar' }] as const;

type SelectOption = string | { readonly value: string; readonly label: string };

const fields = {
  name: { label: 'Nome completo (como aparece na certidão de nascimento)', placeholder: 'Maria Silva', autoComplete: 'name' },
  cpf: { label: 'CPF', placeholder: '000.000.000-00', inputMode: 'numeric' },
  birthDate: { label: 'Data de nascimento', type: 'date', autoComplete: 'bday' },
  phone: { label: 'Telefone / WhatsApp', placeholder: '(81) 90000-0000', type: 'tel', autoComplete: 'tel' },
  email: { label: 'E-mail', placeholder: 'voce@email.com', type: 'email', autoComplete: 'email' },
  cep: { label: 'CEP', placeholder: '00000-000', autoComplete: 'postal-code', inputMode: 'numeric' },
  street: { label: 'Rua', autoComplete: 'address-line1' },
  houseNumber: { label: 'Número', placeholder: 'Ex.: 10 ou S/N' },
  complement: { label: 'Complemento', placeholder: 'Ex.: apartamento 20', autoComplete: 'address-line2' },
  cns: { label: 'Cartão SUS (CNS)', placeholder: '000 0000 0000 0000', inputMode: 'numeric' },
  address: { label: 'Endereço completo', placeholder: 'Rua, número, bairro, cidade', autoComplete: 'street-address' },
  socialName: { label: 'Nome social' },
  gender: { label: 'Identidade de gênero', options: genderOptions, optional: true },
  race: { label: 'Raça/cor', options: raceOptions, optional: true },
  bloodType: { label: 'Tipo sanguíneo', options: bloodTypes, optional: true },
  hasAllergies: { label: 'Você tem alergias conhecidas?', options: allergyOptions, optional: true },
  allergies: { label: 'Quais são as alergias?', optional: true, multiline: true },
  healthConditions: { label: 'Condições de saúde importantes', optional: true, multiline: true, placeholder: 'Ex.: hipertensão, diabetes ou outra condição importante.' },
  emergencyName: { label: 'Nome e sobrenome do contato' },
  emergencyPhone: { label: 'Telefone do contato', type: 'tel', placeholder: '(81) 90000-0000' },
  emergencyRelationship: { label: 'Relação com o paciente', options: emergencyRelationships },
  adminSector: { label: 'Setor de atuação', options: administrativeSectors },
  adminRoleTitle: { label: 'Cargo / Função', placeholder: 'Ex.: Assistente Administrativo' },
  adminRegistration: { label: 'Matrícula institucional', placeholder: 'Ex.: ADM-0101', optional: true },
  adminShift: { label: 'Turno de trabalho', options: administrativeShifts },
} as const;

const teamFields = ['name', 'cpf', 'birthDate', 'phone', 'email', 'address'] as const;
const teamBasicFields = [...teamFields, 'usesSocialName', 'socialName'] as const;
const patientSections = [
  { id: 'personal', title: 'Dados pessoais', fields: ['name', 'socialName', 'birthDate', 'gender', 'race', 'cpf', 'cns'] },
  { id: 'contact', title: 'Formas de contato', fields: ['email', 'phone'] },
  { id: 'address', title: 'Endereço', fields: ['cep', 'street', 'houseNumber', 'complement'] },
] as const;
const specificSections = [
  { id: 'health', title: 'Informações de saúde', fields: ['bloodType', 'hasAllergies', 'allergies', 'healthConditions'] },
  { id: 'emergency', title: 'Contato de emergência', fields: emergencyFields },
] as const;
const patientBasicFields = [...patientSections.flatMap(section => [...section.fields]), 'usesSocialName'] as const;
const fieldClassName = 'h-12 rounded-[1.25rem] border-line-strong bg-surface text-base';
const sectionClassName = 'mb-7 border-b border-line pb-7 last:mb-0 last:border-b-0 last:pb-0';
const patientFormatters: Partial<Record<keyof BasicData, (value: string) => string>> = {
  cpf: formatCpf, cep: formatCep, cns: formatCns, phone: formatPhone, emergencyPhone: formatPhone,
};

function resolveOptionLabel(name: keyof typeof fields, rawValue: string): string {
  const field = fields[name];
  if (!('options' in field)) return rawValue;
  const match = (field.options as readonly SelectOption[]).find(opt =>
    typeof opt === 'string' ? opt === rawValue : opt.value === rawValue,
  );
  if (!match) return rawValue;
  return typeof match === 'string' ? match : match.label;
}

export function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [group, setGroup] = useState<'patient' | 'team'>('patient');
  const [profile, setProfile] = useState<RegistrationProfile | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, trigger, watch, getValues, setValue, reset, formState: { errors } } = useForm<BasicData>({
    resolver: zodResolver(registrationSchema(profile)), defaultValues: emptyBasicData, mode: 'onTouched',
  });
  const usesSocialName = watch('usesSocialName');
  const cep = watch('cep');
  const hasAllergies = watch('hasAllergies');
  const hasEmergencyContact = watch(emergencyFields).some(value => value.trim());
  const isPatient = profile === 'patient';
  const isAdministrative = profile === 'administrative';
  const { message: cepMessage, markStreetEdited } = usePatientAddress(isPatient ? cep : '', getValues, setValue);
  const currentProfile = registrationProfiles.find(item => item.id === profile);

  function goTo(next: number) {
    setStep(next);
    setFurthestStep(previous => Math.max(previous, next));
    setSubmitError(null);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function chooseProfile(value: RegistrationProfile) {
    if (value === 'patient') {
      setValue('cpf', formatCpf(getValues('cpf')));
      setValue('phone', formatPhone(getValues('phone')));
    }
    setProfile(value);
    setCompleted(false);
    setSubmitError(null);
    setFurthestStep(1);
    goTo(1);
  }

  const data = getValues();

  async function advanceToSpecifics() {
    const fieldsToValidate = isPatient ? patientBasicFields : teamBasicFields;
    if (await trigger(fieldsToValidate, { shouldFocus: true })) goTo(2);
  }

  function goToInvalidStep(invalid: FieldErrors<BasicData>) {
    if (isPatient) {
      goTo(!patientBasicFields.some(name => invalid[name]) ? 2 : 1);
      return;
    }
    if (isAdministrative) {
      goTo(!teamBasicFields.some(name => invalid[name]) ? 2 : 1);
      return;
    }
    goTo(1);
  }

  async function onSubmitRegistration(formData: BasicData) {
    if (!isAdministrative) {
      setCompleted(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await administrativeControllerCreate({
        nome: formData.name.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        nascimento: formData.birthDate,
        telefone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        endereco: formData.address.trim(),
        setor: formData.adminSector as CreateAdministrativeUserDtoSetor,
        cargo: formData.adminRoleTitle.trim(),
        matricula: formData.adminRegistration.trim() || undefined,
        turno: formData.adminShift as CreateAdministrativeUserDtoTurno,
      });

      if (response.status === 201) {
        setCompleted(true);
        requestAnimationFrame(() => heading.current?.focus());
        return;
      }

      const detail = (response.data as { detail?: string; message?: string })?.detail
        ?? (response.data as { message?: string })?.message
        ?? 'Não foi possível concluir o cadastro do profissional administrativo.';
      setSubmitError(detail);
    } catch (error) {
      const err = error as {
        status?: number;
        detail?: string;
        title?: string;
        message?: string;
        errors?: Record<string, string[]>;
      };
      if (err.status === 401 || err.status === 403) {
        setSubmitError('Você precisa estar autenticado como Administrador ou Clínica para cadastrar um profissional administrativo.');
      } else {
        const firstFieldError = err.errors ? Object.values(err.errors).flat()[0] : undefined;
        setSubmitError(firstFieldError ?? err.detail ?? err.title ?? err.message ?? 'Erro ao conectar com o servidor.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(name: keyof typeof fields, inEmergencySection = false) {
    const field = name === 'name' && isPatient
      ? { ...fields.name, label: 'Nome completo', placeholder: 'Como aparece no documento' }
      : fields[name];
    const optional = name === 'complement' || 'optional' in field;
    const required = inEmergencySection ? hasEmergencyContact : !optional;
    const label = optional ? `${field.label} (opcional)` : `${field.label}${required ? ' *' : ''}`;
    const input = register(name);
    const format = isPatient ? patientFormatters[name] : undefined;
    const isCep = name === 'cep';
    const error = errors[name]?.message;
    const description = [error && `error-${name}`, isCep && 'cep-help', isCep && 'cep-result'].filter(Boolean).join(' ');
    const multiline = 'multiline' in field;
    const fullWidth = multiline || name === 'address' || (isPatient && (name === 'name' || name === 'cns'));
    const control = {
      id: `registration-${name}`,
      required,
      'aria-invalid': !!error,
      'aria-describedby': description || undefined,
      ...input,
    };

    return <div key={name} className={`[&>div>label]:text-base ${fullWidth ? 'sm:col-span-2' : ''}`}>
      {'options' in field || multiline ? <div className="flex w-full flex-col gap-1.5">
        <label htmlFor={control.id} className="text-base font-medium text-heading">{label}</label>
        {'options' in field ? <select {...control} className={`${fieldClassName} w-full border px-3 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring`}>
          <option value="">Selecione</option>
          {(field.options as readonly SelectOption[]).map(option => {
            const optValue = typeof option === 'string' ? option : option.value;
            const optLabel = typeof option === 'string' ? option : option.label;
            return <option key={optValue} value={optValue}>{optLabel}</option>;
          })}
        </select> : <textarea {...control} rows={3} placeholder={'placeholder' in field ? field.placeholder : undefined} className="w-full rounded-[1.25rem] border border-line-strong bg-surface px-3 py-2 text-base text-body placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" />}
      </div> : <Input {...field} {...control} label={label} className={fieldClassName}
        onChange={event => {
          if (format) event.target.value = format(event.target.value);
          if (name === 'street') markStreetEdited();
          void input.onChange(event);
        }} />}
      {error && <p role="alert" id={`error-${name}`} className="mt-1 text-base text-danger-text">{error}</p>}
      {isCep && <>
        <p id="cep-help" className="mt-1 text-base text-muted">Usamos o ViaCEP para buscar a rua pelo CEP.</p>
        <p id="cep-result" aria-live="polite" className="text-base text-muted">{cepMessage}</p>
      </>}
    </div>;
  }

  function renderSocialName() {
    const error = errors.socialName?.message;

    return <fieldset key="socialName" className="min-w-0 sm:col-span-2">
      <legend className="mb-2 font-medium text-heading">Você utiliza nome social? <span className="text-base font-normal text-muted">(opcional)</span></legend>
      <p className="mb-3 text-base text-muted">Nome social é o nome pelo qual você prefere ser chamado(a), mesmo que seja diferente do nome que está no documento.</p>
      <div className="grid gap-2 sm:grid-cols-3">{answers.map(answer => <label key={answer.value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[1.25rem] border border-line-strong bg-surface px-4 py-3 text-base has-checked:border-brand-primary has-checked:bg-brand-subtle">
        <input type="radio" value={answer.value} className="h-4 w-4 accent-brand-primary" {...register('usesSocialName')} />{answer.label}
      </label>)}</div>
      {usesSocialName === 'yes' && <div className="mt-4 [&>div>label]:text-base">
        <Input id="registration-social-name" label="Como você prefere ser chamado(a)? (opcional)" className="h-12 rounded-[1.25rem] bg-surface text-base" {...register('socialName')}
          aria-invalid={!!error} aria-describedby={error ? 'error-social-name' : undefined} />
        {error && <p role="alert" id="error-social-name" className="mt-1 text-base text-danger-text">{error}</p>}
      </div>}
    </fieldset>;
  }

  function showField(name: keyof typeof fields) {
    if (name === 'socialName') return usesSocialName === 'yes';
    if (name === 'allergies') return hasAllergies === 'Sim';
    return true;
  }

  function reviewFields(names: readonly (keyof typeof fields)[]) {
    return names.filter(name => data[name].trim() && showField(name));
  }

  function renderReviewFields(names: readonly (keyof typeof fields)[]) {
    return <dl className="grid gap-5 sm:grid-cols-2">
      {reviewFields(names).map(name => {
        const value = resolveOptionLabel(name, data[name].trim());
        return <div key={name} className="min-w-0">
          <dt className="text-base text-muted">{name === 'name' && isPatient ? 'Nome completo' : fields[name].label}</dt>
          <dd className="mt-1 break-words font-medium text-heading">{name === 'birthDate' ? value.split('-').reverse().join('/') : value}</dd>
        </div>;
      })}
    </dl>;
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-canvas px-4 py-6 text-lg text-body sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-52 -top-60 -z-10 h-[600px] w-[600px] rounded-full bg-accent-subtle" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-40 -z-10 h-[530px] w-[530px] rounded-full bg-brand-subtle" />
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-3 rounded-lg">
            <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary font-bold text-on-brand">CD</span>
            <span><span className="block text-2xl font-semibold text-heading">Clínica Digital UFPE</span><span className="text-base text-muted">Cadastro e identificação</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="lg" variant="outline" className="gap-2 rounded-full bg-surface" aria-expanded={showHelp} aria-controls="registration-help" onClick={() => setShowHelp(!showHelp)}>
              <CircleHelp aria-hidden="true" className="h-4 w-4" /> Precisa de ajuda?
            </Button>
          </div>
        </header>

        {showHelp && <aside id="registration-help" className="mb-6 rounded-2xl border border-line bg-surface p-5 text-base">Escolha o perfil de quem será cadastrado. Preencha os campos com * e use Voltar para corrigir informações.</aside>}

        <nav aria-label="Etapas do cadastro" className="mb-7">
          <div className="mb-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm font-bold uppercase tracking-widest text-brand-text">
            <span>Etapa {step + 1} de 4</span><span>{stepDescriptions[step]}</span>
          </div>
          <ol className="grid grid-cols-4 gap-2">
            {steps.map((label, index) => <li key={label}>
              <button type="button" disabled={index > furthestStep || completed} onClick={() => {
                if (index === 2 && step === 1 && (isPatient || isAdministrative)) void advanceToSpecifics();
                else if (index > step && index > 1) void handleSubmit(() => goTo(index), goToInvalidStep)();
                else goTo(index);
              }} aria-current={step === index ? 'step' : undefined} className="w-full rounded text-left text-sm disabled:cursor-default sm:text-base">
                <span className={`mb-2 block h-1.5 rounded-full ${index <= step ? 'bg-brand-primary' : 'bg-line'}`} />
                <span className={`flex items-center gap-1 ${index === step ? 'font-semibold text-heading' : 'text-muted'}`}>
                  {index < step && <Check aria-hidden="true" className="hidden h-3 w-3 sm:block" />}{index + 1}. {label}
                </span>
              </button>
            </li>)}
          </ol>
        </nav>

        <main className="rounded-[2rem] border border-line bg-surface p-5 shadow-sm sm:p-10">
          <h1 ref={heading} tabIndex={-1} className="break-words text-4xl font-bold leading-tight tracking-tight text-heading outline-none sm:text-[2.5rem]">
            {completed
              ? (isAdministrative ? 'Profissional administrativo cadastrado!' : 'Simulação concluída')
              : ['Quem você quer cadastrar?', isPatient ? 'Dados básicos' : 'Dados pessoais', 'Dados específicos', 'Revise as informações'][step]}
          </h1>
          {completed ? <div className="mt-6 space-y-6">
            <p role="status">
              {isAdministrative
                ? `O cadastro de ${data.name} (${data.email}) foi salvo no banco de dados e provisionado no Keycloak com o perfil Administrativo.`
                : 'Você concluiu a simulação de cadastro. Nenhuma conta foi criada.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => { reset(emptyBasicData); setProfile(null); setGroup('patient'); setCompleted(false); setFurthestStep(0); goTo(0); }}>Iniciar novo cadastro</Button>
              {isAdministrative && <Link to="/users"><Button size="lg" variant="outline">Ver usuários cadastrados</Button></Link>}
            </div>
          </div> : <>
            {!((isPatient || isAdministrative) && (step === 1 || step === 2)) && <p className="mt-3 text-lg text-muted sm:text-xl">{[
              <>Escolha uma opção para começar. Se você vai receber atendimento, selecione <strong className="text-heading">Sou paciente.</strong></>,
              'Informações iniciais para identificar a conta no sistema.',
              'Confira o perfil escolhido antes de revisar as informações.',
              'Confira os dados preenchidos. Você pode voltar para corrigir qualquer informação.',
            ][step]}</p>}

            {step === 0 && <>
              <div role="group" aria-label="Tipo de cadastro" className="my-7 grid grid-cols-2 gap-1 rounded-3xl border border-line bg-surface-muted p-1.5">
                {(['patient', 'team'] as const).map(value => <button key={value} type="button" aria-pressed={group === value} onClick={() => setGroup(value)} className={`flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] px-3 font-semibold transition-colors ${group === value ? 'bg-brand-primary text-on-brand shadow-sm' : 'text-body hover:bg-surface-strong'}`}>
                  {value === 'patient' && <User aria-hidden="true" className="h-5 w-5" />}{value === 'patient' ? 'Paciente' : 'Equipe e instituições'}
                </button>)}
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <section aria-label="Perfis disponíveis" className={group === 'patient' ? '' : 'grid gap-4 sm:grid-cols-2'}>
                  {registrationProfiles.filter(item => group === 'patient' ? item.id === 'patient' : item.id !== 'patient').map(item => {
                    const Icon = icons[item.id];
                    return <article key={item.id} className={`flex h-full flex-col items-start rounded-3xl border p-6 sm:p-8 ${profile === item.id ? 'border-brand-primary bg-brand-subtle' : 'border-line bg-accent-subtle'}`}>
                      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary text-on-brand shadow-sm"><Icon aria-hidden="true" className="h-8 w-8" /></span>
                      <h2 className="break-words text-3xl font-bold text-heading">{item.id === 'patient' ? 'Sou paciente' : item.label}</h2>
                      <p className="mb-7 mt-3 flex-1 leading-relaxed">{item.description}</p>
                      <Button size="lg" className="h-auto min-h-12 gap-2 whitespace-normal rounded-full py-3 text-left" onClick={() => chooseProfile(item.id)}>
                        {item.id === 'patient' ? 'Começar cadastro de paciente' : `Selecionar ${item.label.toLowerCase()}`}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                      </Button>
                      {profile === item.id && <span className="mt-3 flex items-center gap-1 text-base font-medium text-brand-text"><Check aria-hidden="true" className="h-4 w-4" />Perfil selecionado</span>}
                    </article>;
                  })}
                </section>
                <aside className="rounded-3xl border border-line p-7">
                  <h2 className="mb-6 text-2xl font-semibold text-heading">Como funciona</h2>
                  <ol className="space-y-6">{[
                    ['Escolha o cadastro', 'Você está aqui.'], ['Informe os dados', 'Nome, documento e contato.'], ['Confira e conclua', 'Revise e finalize.'],
                  ].map(([title, description], index) => <li key={title} className="flex gap-4">
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent text-xl font-semibold text-accent-text">{index + 1}</span>
                    <div><p className="font-semibold text-heading">{index + 1}. {title}</p><p className="mt-1 text-base text-muted">{description}</p></div>
                  </li>)}</ol>
                </aside>
              </div>
            </>}

            {step === 1 && <form noValidate onSubmit={event => {
              if (isPatient || isAdministrative) {
                event.preventDefault();
                void advanceToSpecifics();
              } else {
                void handleSubmit(() => goTo(2))(event);
              }
            }} className="mt-8">
              {isPatient ? <div className="rounded-3xl bg-accent-subtle p-5 sm:p-7">
                <p className="mb-5 text-base text-muted">Campos com <strong>*</strong> são obrigatórios.</p>
                {patientSections.map((section, index) => <section key={section.id} aria-labelledby={`basic-${section.id}`} className={sectionClassName}>
                  <h2 id={`basic-${section.id}`} className="mb-4 text-2xl font-semibold text-heading">{index + 1}. {section.title}</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {section.fields.map(name => name === 'socialName' ? renderSocialName() : renderField(name))}
                  </div>
                </section>)}
              </div> : <section aria-label="Informações iniciais" className="rounded-3xl bg-accent-subtle p-5 sm:p-7">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent-text">Informações iniciais · {currentProfile?.label}</h2>
                <p className="mb-5 mt-3 text-base text-muted">Campos com <strong>*</strong> são obrigatórios.</p>
                <div className="grid gap-5 sm:grid-cols-2">{teamFields.map(name => renderField(name))}</div>
                <div className="mt-7 space-y-6 border-t border-line pt-7">
                  <div><h2 className="text-sm font-bold uppercase tracking-widest text-accent-text">Identificação e acolhimento</h2><p className="mt-3 text-base text-muted">Estas perguntas são opcionais. Você pode responder, escolher “Prefiro não informar” ou pular.</p></div>
                  {renderSocialName()}
                </div>
              </section>}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><p className="text-base text-muted">Perfil: {currentProfile?.label}</p><div className="flex gap-3"><Button size="lg" type="button" variant="outline" className="rounded-full px-4 sm:px-6" onClick={() => goTo(0)}>Voltar</Button><Button size="lg" type="submit" className="rounded-full px-4 sm:px-6">Próximo<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div></div>
            </form>}

            {step === 2 && (isPatient ? <form noValidate onSubmit={handleSubmit(() => goTo(3), goToInvalidStep)} className="mt-8 space-y-6">
              <div className="rounded-3xl bg-accent-subtle p-5 sm:p-7">
                {specificSections.map((section, index) => <section key={section.id} aria-labelledby={`specific-${section.id}`} className={sectionClassName}>
                  <h2 id={`specific-${section.id}`} className="mb-4 text-2xl font-semibold text-heading">{index + 1}. {section.title}</h2>
                  {section.id === 'emergency' && <p className="mb-4 text-base text-muted">O contato de emergência é opcional. Se quiser indicar alguém, preencha os três campos.</p>}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {section.fields.filter(showField).map(name => renderField(name, section.id === 'emergency'))}
                  </div>
                </section>)}
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <Button size="lg" type="button" variant="outline" className="rounded-full px-4 sm:px-6" onClick={() => goTo(1)}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Voltar</Button>
                <Button size="lg" type="submit" className="rounded-full px-4 sm:px-6">Revisar dados<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button>
              </div>
            </form> : isAdministrative ? <form noValidate onSubmit={handleSubmit(() => goTo(3), goToInvalidStep)} className="mt-8 space-y-6">
              <section aria-labelledby="specific-admin" className="rounded-3xl bg-accent-subtle p-5 sm:p-7">
                <h2 id="specific-admin" className="mb-2 text-2xl font-semibold text-heading">Dados funcionais · Profissional administrativo</h2>
                <p className="mb-5 text-base text-muted">Informe o setor, cargo e turno de atuação na clínica. Campos com <strong>*</strong> são obrigatórios.</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {administrativeSpecificFields.map(name => renderField(name))}
                </div>
              </section>
              <div className="flex flex-wrap justify-between gap-3">
                <Button size="lg" type="button" variant="outline" className="rounded-full px-4 sm:px-6" onClick={() => goTo(1)}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Voltar</Button>
                <Button size="lg" type="submit" className="rounded-full px-4 sm:px-6">Revisar dados<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button>
              </div>
            </form> : <div className="mt-8 space-y-6">
              <section className="rounded-3xl bg-accent-subtle p-7"><h2 className="text-2xl font-semibold text-heading">{currentProfile?.label}</h2><p className="mt-3 leading-relaxed">Esta simulação coleta apenas os dados básicos. As informações específicas de cada perfil ainda não são solicitadas. Continue para revisar o que você preencheu.</p></section>
              <div className="flex flex-wrap justify-between gap-3"><Button size="lg" variant="outline" className="rounded-full px-4 sm:px-6" onClick={() => goTo(1)}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Voltar</Button><Button size="lg" className="rounded-full px-4 sm:px-6" onClick={() => goTo(3)}>Revisar dados<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div>
            </div>)}

            {step === 3 && <div className="mt-8 space-y-6">
              <section className="rounded-3xl bg-accent-subtle p-7"><h2 className="mb-6 text-2xl font-semibold text-heading">Perfil: {currentProfile?.label}</h2>
                {isPatient ? [...patientSections, ...specificSections].filter(section => reviewFields(section.fields).length > 0).map(section => <section key={section.id} aria-labelledby={`review-${section.id}`} className={sectionClassName}>
                  <h3 id={`review-${section.id}`} className="mb-4 text-xl font-semibold text-heading">{section.title}</h3>
                  {renderReviewFields(section.fields)}
                </section>) : isAdministrative ? <>
                  <section aria-labelledby="review-admin-personal" className={sectionClassName}>
                    <h3 id="review-admin-personal" className="mb-4 text-xl font-semibold text-heading">Dados pessoais</h3>
                    {renderReviewFields([...teamFields, 'socialName'])}
                  </section>
                  <section aria-labelledby="review-admin-functional" className={sectionClassName}>
                    <h3 id="review-admin-functional" className="mb-4 text-xl font-semibold text-heading">Dados funcionais</h3>
                    {renderReviewFields(administrativeSpecificFields)}
                  </section>
                </> : renderReviewFields([...teamFields, 'socialName'])}
              </section>
              {submitError && (
                <div role="alert" className="rounded-2xl border border-danger-text bg-surface p-4 text-base text-danger-text">
                  {submitError}
                </div>
              )}
              <p className="text-base text-muted">
                {isAdministrative
                  ? 'Ao confirmar, a conta será criada no sistema e vinculada ao perfil Administrativo.'
                  : 'Ao concluir, você termina somente esta simulação.'}
              </p>
              <div className="flex flex-wrap justify-between gap-3">
                <Button size="lg" variant="outline" disabled={submitting} className="rounded-full px-4 sm:px-6" onClick={() => goTo(2)}>Voltar</Button>
                <Button size="lg" disabled={submitting} className="rounded-full px-4 sm:px-6" onClick={handleSubmit(onSubmitRegistration, goToInvalidStep)}>
                  {submitting ? 'Cadastrando...' : isAdministrative ? 'Confirmar cadastro' : 'Concluir simulação'}
                  <Check aria-hidden="true" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>}
          </>}
        </main>
        <footer className="mt-6 space-y-2 text-center text-base leading-relaxed text-muted">
          <p>Diferentes contas possuem diferentes acessos e enxergam o sistema de maneira diferente.</p>
          <p>Protótipo acadêmico · Clínica Digital UFPE</p>
        </footer>
      </div>
    </div>
  );
}
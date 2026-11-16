import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Building2, Check, CircleHelp, GraduationCap, Stethoscope, User, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { basicDataSchema, emptyBasicData, registrationProfiles, type BasicData, type RegistrationProfile } from './registration-model';

const steps = ['Seleção', 'Dados básicos', 'Específicos', 'Revisão'];
const stepDescriptions = ['Seleção de perfil', 'Informações iniciais', 'Dados do perfil', 'Confira seus dados'];
const icons = { patient: User, clinic: Building2, administrative: Users, health: Stethoscope, student: GraduationCap };
const answers = [{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }, { value: 'undisclosed', label: 'Prefiro não informar' }] as const;

export function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [group, setGroup] = useState<'patient' | 'team'>('patient');
  const [profile, setProfile] = useState<RegistrationProfile | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, watch, getValues, reset, formState: { errors } } = useForm<BasicData>({
    resolver: zodResolver(basicDataSchema), defaultValues: emptyBasicData, mode: 'onTouched',
  });
  const usesSocialName = watch('usesSocialName');
  const currentProfile = registrationProfiles.find(item => item.id === profile);

  function goTo(next: number) {
    setStep(next);
    setFurthestStep(previous => Math.max(previous, next));
    requestAnimationFrame(() => heading.current?.focus());
  }

  function chooseProfile(value: RegistrationProfile) {
    setProfile(value);
    setCompleted(false);
    // Revalida os dados básicos antes de permitir avançar novamente.
    setFurthestStep(1);
    goTo(1);
  }

  const fields = [
    { name: 'name', label: 'Nome completo (como aparece na certidão de nascimento)', placeholder: 'Maria Silva', autoComplete: 'name' },
    { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00', inputMode: 'numeric' },
    { name: 'birthDate', label: 'Data de nascimento', type: 'date', autoComplete: 'bday' },
    { name: 'phone', label: 'Telefone / WhatsApp', placeholder: '(81) 90000-0000', type: 'tel', autoComplete: 'tel' },
    { name: 'email', label: 'E-mail', placeholder: 'voce@email.com', type: 'email', autoComplete: 'email' },
    { name: 'address', label: 'Endereço completo', placeholder: 'Rua, número, bairro, cidade', autoComplete: 'street-address' },
  ] as const;
  const data = getValues();

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-canvas px-4 py-6 text-body sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-52 -top-60 -z-10 h-[600px] w-[600px] rounded-full bg-accent-subtle" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-40 -z-10 h-[530px] w-[530px] rounded-full bg-brand-subtle" />
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-3 rounded-lg">
            <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary font-bold text-on-brand">CD</span>
            <span><span className="block text-xl font-semibold text-heading">Clínica Digital UFPE</span><span className="text-sm text-muted">Cadastro e identificação</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" className="gap-2 rounded-full bg-surface" aria-expanded={showHelp} aria-controls="registration-help" onClick={() => setShowHelp(!showHelp)}>
              <CircleHelp aria-hidden="true" className="h-4 w-4" /> Precisa de ajuda?
            </Button>
          </div>
        </header>

        {showHelp && <aside id="registration-help" className="mb-6 rounded-2xl border border-line bg-surface p-5 text-sm">Escolha o perfil de quem será cadastrado. Preencha os campos com * e use Voltar para corrigir informações. Os dados ficam somente nesta página e são descartados ao recarregar ou sair dela.</aside>}

        <nav aria-label="Etapas do cadastro" className="mb-7">
          <div className="mb-3 flex justify-between gap-4 text-xs font-bold uppercase tracking-widest text-brand-text">
            <span>Etapa {step + 1} de 4</span><span>{stepDescriptions[step]}</span>
          </div>
          <ol className="grid grid-cols-4 gap-2">
            {steps.map((label, index) => <li key={label}>
              <button type="button" disabled={index > furthestStep || completed} onClick={() => {
                if (index > step && index > 1) void handleSubmit(() => goTo(index), () => goTo(1))();
                else goTo(index);
              }} aria-current={step === index ? 'step' : undefined} className="w-full rounded text-left text-xs disabled:cursor-default sm:text-sm">
                <span className={`mb-2 block h-1.5 rounded-full ${index <= step ? 'bg-brand-primary' : 'bg-line'}`} />
                <span className={`flex items-center gap-1 ${index === step ? 'font-semibold text-heading' : 'text-muted'}`}>
                  {index < step && <Check aria-hidden="true" className="hidden h-3 w-3 sm:block" />}{index + 1}. {label}
                </span>
              </button>
            </li>)}
          </ol>
        </nav>

        <main className="rounded-[2rem] border border-line bg-surface p-5 shadow-sm sm:p-10">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold tracking-tight text-heading outline-none sm:text-4xl">
            {completed ? 'Simulação concluída' : ['Quem você quer cadastrar?', 'Dados pessoais', 'Dados específicos', 'Revise as informações'][step]}
          </h1>
          {completed ? <div className="mt-6 space-y-6">
            <p role="status">Você concluiu a simulação de cadastro. Nenhuma conta foi criada e nenhum dado foi salvo ou enviado.</p>
            <Button onClick={() => { reset(emptyBasicData); setProfile(null); setGroup('patient'); setCompleted(false); setFurthestStep(0); goTo(0); }}>Iniciar novo cadastro</Button>
          </div> : <>
            <p className="mt-3 text-base text-muted sm:text-lg">{[
              <>Escolha uma opção para começar. Se a pessoa vai receber atendimento, selecione <strong className="text-heading">Paciente.</strong></>,
              'Informações iniciais para identificar a conta no sistema.',
              'Confira o perfil escolhido antes de revisar as informações.',
              'Confira os dados preenchidos. Você pode voltar para corrigir qualquer informação.',
            ][step]}</p>

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
                      <h2 className="text-2xl font-bold text-heading">{item.id === 'patient' ? 'Cadastrar paciente' : item.label}</h2>
                      <p className="mb-7 mt-3 flex-1 leading-relaxed">{item.description}</p>
                      <Button className="h-auto min-h-12 gap-2 whitespace-normal rounded-full py-3 text-left" onClick={() => chooseProfile(item.id)}>
                        {item.id === 'patient' ? 'Começar cadastro de paciente' : `Selecionar ${item.label.toLowerCase()}`}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                      </Button>
                      {profile === item.id && <span className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-text"><Check aria-hidden="true" className="h-4 w-4" />Perfil selecionado</span>}
                    </article>;
                  })}
                </section>
                <aside className="rounded-3xl border border-line p-7">
                  <h2 className="mb-6 text-xl font-semibold text-heading">Como funciona</h2>
                  <ol className="space-y-6">{[
                    ['Escolha o cadastro', 'Você está aqui.'], ['Informe os dados', 'Nome, documento e contato.'], ['Confira e conclua', 'Revise e finalize.'],
                  ].map(([title, description], index) => <li key={title} className="flex gap-4">
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent text-lg font-semibold text-accent-text">{index + 1}</span>
                    <div><p className="font-semibold text-heading">{index + 1}. {title}</p><p className="mt-1 text-sm text-muted">{description}</p></div>
                  </li>)}</ol>
                </aside>
              </div>
            </>}

            {step === 1 && <form noValidate onSubmit={handleSubmit(() => goTo(2))} className="mt-8">
              <section aria-label="Informações iniciais" className="rounded-3xl bg-accent-subtle p-5 sm:p-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent-text">Informações iniciais · {currentProfile?.label}</h2>
                <p className="mb-5 mt-3 text-sm text-muted">Campos com <strong>*</strong> são obrigatórios.</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map(field => <div key={field.name} className={field.name === 'address' ? 'sm:col-span-2' : ''}>
                    <Input {...field} id={`registration-${field.name}`} label={`${field.label} *`} required
                      className="h-12 rounded-[1.25rem] border-line-strong bg-surface"
                      aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
                      {...register(field.name)} />
                    {errors[field.name] && <p role="alert" id={`error-${field.name}`} className="mt-1 text-sm text-danger-text">{errors[field.name]?.message}</p>}
                  </div>)}
                </div>
                <div className="mt-7 space-y-6 border-t border-line pt-7">
                  <div><h2 className="text-xs font-bold uppercase tracking-widest text-accent-text">Identificação e acolhimento</h2><p className="mt-3 text-sm text-muted">Estas perguntas são opcionais. Você pode responder, escolher “Prefiro não informar” ou pular.</p></div>
                  {([{ name: 'usesSocialName', title: 'Você utiliza nome social?' }] as const).map(question => <fieldset key={question.name}>
                    <legend className="mb-2 font-medium text-heading">{question.title} <span className="text-sm font-normal text-muted">(opcional)</span></legend>
                    {question.name === 'usesSocialName' && <p className="mb-3 text-sm text-muted">Nome social é o nome pelo qual você prefere ser chamado(a), mesmo que seja diferente do nome que está no documento.</p>}
                    <div className="grid gap-2 sm:grid-cols-3">{answers.map(answer => <label key={answer.value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[1.25rem] border border-line-strong bg-surface px-4 py-3 text-sm has-checked:border-brand-primary has-checked:bg-brand-subtle">
                      <input type="radio" value={answer.value} className="h-4 w-4 accent-brand-primary" {...register(question.name)} />{answer.label}
                    </label>)}</div>
                    {question.name === 'usesSocialName' && usesSocialName === 'yes' && <div className="mt-4"><Input id="registration-social-name" label="Como você prefere ser chamado(a)? (opcional)" className="h-12 rounded-[1.25rem] bg-surface" {...register('socialName')} error={errors.socialName?.message} /></div>}
                  </fieldset>)}
                </div>
              </section>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted">Perfil: {currentProfile?.label}</p><div className="flex gap-3"><Button type="button" variant="outline" className="rounded-full" onClick={() => goTo(0)}>Voltar</Button><Button type="submit" className="rounded-full">Próximo<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div></div>
            </form>}

            {step === 2 && <div className="mt-8 space-y-6">
              <section className="rounded-3xl bg-accent-subtle p-7"><h2 className="text-xl font-semibold text-heading">{currentProfile?.label}</h2><p className="mt-3 leading-relaxed">Esta simulação coleta apenas os dados básicos. As informações específicas de cada perfil ainda não são solicitadas. Continue para revisar o que você preencheu.</p></section>
              <div className="flex justify-between gap-3"><Button variant="outline" className="rounded-full" onClick={() => goTo(1)}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Voltar</Button><Button className="rounded-full" onClick={() => goTo(3)}>Revisar dados<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div>
            </div>}

            {step === 3 && <div className="mt-8 space-y-6">
              <section className="rounded-3xl bg-accent-subtle p-7"><h2 className="mb-6 text-xl font-semibold text-heading">Perfil: {currentProfile?.label}</h2>
                <dl className="grid gap-5 sm:grid-cols-2">{fields.map(field => <div key={field.name} className="min-w-0"><dt className="text-sm text-muted">{field.label}</dt><dd className="mt-1 break-words font-medium text-heading">{field.name === 'birthDate' ? data.birthDate.split('-').reverse().join('/') : data[field.name]}</dd></div>)}
                  {usesSocialName === 'yes' && data.socialName && <div><dt className="text-sm text-muted">Nome social</dt><dd className="mt-1 break-words font-medium text-heading">{data.socialName}</dd></div>}
                </dl>
              </section>
              <p className="text-sm text-muted">Ao concluir, você termina somente esta simulação. Nenhum dado será enviado ou salvo.</p>
              <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" className="rounded-full" onClick={() => goTo(2)}>Voltar</Button><Button className="rounded-full" onClick={handleSubmit(() => setCompleted(true), () => goTo(1))}>Concluir simulação<Check aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div>
            </div>}
          </>}
        </main>
        <footer className="mt-6 space-y-2 text-center text-sm leading-relaxed text-muted">
          <p>Diferentes contas possuem diferentes acessos e enxergam o sistema de maneira diferente.</p>
          <p>Protótipo acadêmico · Clínica Digital UFPE · Nenhum dado é salvo ou enviado.</p>
        </footer>
      </div>
    </div>
  );
}

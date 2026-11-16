import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../context/theme-context';
import { RegistrationPage } from './registration-page';
import { basicDataSchema, emptyBasicData } from './registration-model';

afterEach(cleanup);

function openRegistration() {
  render(<ThemeProvider><MemoryRouter><RegistrationPage /></MemoryRouter></ThemeProvider>);
}

function startPatient() {
  fireEvent.click(screen.getByRole('button', { name: 'Começar cadastro de paciente' }));
}

function fillBasicData() {
  for (const [label, value] of [
    [/Nome completo/, 'Maria Silva'], [/CPF/, '123.456.789-00'],
    [/Data de nascimento/, '2000-01-15'], [/Telefone \/ WhatsApp/, '(81) 99999-9999'],
    [/E-mail/, 'maria@example.com'], [/Endereço completo/, 'Rua das Flores, 10, Recife'],
  ] as const) fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('Cadastro — KAN-80 e KAN-81', () => {
  it('oferece os cinco perfis nos dois grupos e mantém o perfil ao voltar', () => {
    openRegistration();
    expect(screen.getByRole('button', { name: 'Começar cadastro de paciente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Dados básicos' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Equipe e instituições' }));
    for (const name of ['Selecionar clínica', 'Selecionar profissional administrativo', 'Selecionar profissional de saúde', 'Selecionar estudante / estagiário']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar clínica' }));
    expect(screen.getByText('Perfil: Clínica')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Perfil selecionado')).toBeInTheDocument();
  });

  it('bloqueia avanço com campos vazios e mostra erros associados aos campos', async () => {
    openRegistration(); startPatient();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(6));
    expect(screen.getByLabelText(/CPF/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados pessoais' })).toBeInTheDocument();
  });

  it('preserva valores, valida atalhos de etapas e permite concluir somente a simulação', async () => {
    openRegistration(); startPatient(); fillBasicData();
    fireEvent.click(screen.getByLabelText('Sim', { selector: 'input[name="usesSocialName"]' }));
    fireEvent.change(screen.getByLabelText(/Como você prefere/), { target: { value: 'Mari' } });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
    expect(screen.getByText('Mari')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2. Dados básicos' }));
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Maria Silva');
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'invalido' } });
    fireEvent.click(screen.getByRole('button', { name: '4. Revisão' }));
    await screen.findByText('Informe um e-mail válido.');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados pessoais' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'maria@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir simulação' }));
    await screen.findByRole('status');
    expect(screen.getByText(/Nenhuma conta foi criada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar novo cadastro' }));
    startPatient();
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue('');
  });

  it('rejeita formatos inválidos e datas futuras, permitindo omitir respostas opcionais', () => {
    const valid = { ...emptyBasicData, name: 'Maria Silva', cpf: '12345678900', birthDate: '2000-01-15', phone: '81999999999', email: 'maria@example.com', address: 'Rua das Flores, Recife' };
    expect(basicDataSchema.safeParse(valid).success).toBe(true);
    for (const invalid of [{ cpf: '123' }, { phone: 'abc81999999999' }, { email: 'invalido' }, { birthDate: '2999-01-01' }, { birthDate: '2001-02-30' }, { name: '   ' }]) {
      expect(basicDataSchema.safeParse({ ...valid, ...invalid }).success).toBe(false);
    }
  });
});

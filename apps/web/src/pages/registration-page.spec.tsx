import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../context/theme-context';
import { RegistrationPage } from './registration-page';
import { basicDataSchema, emptyBasicData } from './registration-model';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function addressResponse(data: { logradouro?: string; erro?: boolean | string }) {
  return new Response(JSON.stringify(data));
}

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
    [/E-mail/, 'maria@example.com'],
  ] as const) fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('Cadastro — KAN-80 e KAN-81', () => {
  it('oferece os cinco perfis nos dois grupos e mantém o perfil ao voltar', () => {
    openRegistration();
    expect(screen.getByRole('heading', { name: 'Sou paciente' })).toBeInTheDocument();
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
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(8));
    expect(screen.getByLabelText(/CPF/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados pessoais' })).toBeInTheDocument();
  });

  it('preserva valores, valida atalhos de etapas e permite concluir somente a simulação', async () => {
    const fetchAddress = vi.fn().mockResolvedValue(addressResponse({ logradouro: 'Rua das Flores' }));
    vi.stubGlobal('fetch', fetchAddress);
    openRegistration(); startPatient(); fillBasicData();
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: '50000000' } });
    expect(screen.getByLabelText(/CEP/)).toHaveValue('50000-000');
    await waitFor(() => expect(screen.getByLabelText(/^Rua/)).toHaveValue('Rua das Flores'));
    expect(fetchAddress).toHaveBeenCalledWith('https://viacep.com.br/ws/50000000/json/', expect.anything());
    expect(screen.getByLabelText(/^Número \*/)).toHaveValue('');
    fireEvent.change(screen.getByLabelText(/^Rua/), { target: { value: 'Rua das Flores Nova' } });
    fireEvent.change(screen.getByLabelText(/^Número \*/), { target: { value: 'S/N' } });
    fireEvent.change(screen.getByLabelText(/Cartão SUS/), { target: { value: '012abc' } });
    expect(screen.getByLabelText(/Cartão SUS/)).toHaveValue('012');
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByText('Informe os 15 dígitos do Cartão SUS.');
    fireEvent.change(screen.getByLabelText(/Cartão SUS/), { target: { value: '01234567890123456789' } });
    fireEvent.click(screen.getByLabelText('Sim', { selector: 'input[name="usesSocialName"]' }));
    fireEvent.change(screen.getByLabelText(/Como você prefere/), { target: { value: 'Mari' } });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
    expect(screen.getByText('Mari')).toBeInTheDocument();
    for (const value of ['50000-000', 'Rua das Flores Nova', 'S/N', '012345678901234']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    expect(screen.queryByText('Complemento')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '2. Dados básicos' }));
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Maria Silva');
    expect(screen.getByLabelText(/^Rua/)).toHaveValue('Rua das Flores Nova');
    expect(screen.getByLabelText(/^Número \*/)).toHaveValue('S/N');
    expect(screen.getByLabelText(/Cartão SUS/)).toHaveValue('012345678901234');
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

  it('formata o CPF durante digitação e colagem', () => {
    openRegistration(); startPatient();
    const cpf = screen.getByLabelText(/CPF/);
    for (const value of '12345678900') {
      fireEvent.input(cpf, { target: { value: (cpf as HTMLInputElement).value + value } });
    }
    expect(cpf).toHaveValue('123.456.789-00');
    for (const value of ['01234567890', '012.345.678-90', 'abc0123456789012']) {
      fireEvent.input(cpf, { inputType: 'insertFromPaste', target: { value } });
      expect(cpf).toHaveValue('012.345.678-90');
    }
  });

  it('ignora respostas antigas e preserva a rua digitada durante a consulta', async () => {
    const requests: Array<(response: Response) => void> = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => requests.push(resolve))));
    openRegistration(); startPatient();
    const cep = screen.getByLabelText(/CEP/);
    const street = screen.getByLabelText(/^Rua/);
    fireEvent.change(cep, { target: { value: '50000001' } });
    fireEvent.change(cep, { target: { value: '50000002' } });
    await act(async () => requests[1](addressResponse({ logradouro: 'Rua atual' })));
    await act(async () => requests[0](addressResponse({ logradouro: 'Rua antiga' })));
    expect(street).toHaveValue('Rua atual');
    fireEvent.change(cep, { target: { value: '50000003' } });
    fireEvent.change(street, { target: { value: 'Rua digitada' } });
    await act(async () => requests[2](addressResponse({ logradouro: 'Outra rua' })));
    expect(street).toHaveValue('Rua digitada');
  });

  it('avisa quando o CEP não é encontrado ou a conexão falha e aceita o endereço manual', async () => {
    const fetchAddress = vi.fn()
      .mockResolvedValueOnce(addressResponse({ erro: 'true' }))
      .mockRejectedValueOnce(new TypeError('Falha de conexão'));
    vi.stubGlobal('fetch', fetchAddress);
    openRegistration(); startPatient(); fillBasicData();
    const cep = screen.getByLabelText(/CEP/);
    fireEvent.change(cep, { target: { value: '9999999' } });
    expect(cep).toHaveValue('99999-99');
    expect(fetchAddress).not.toHaveBeenCalled();
    fireEvent.change(cep, { target: { value: '99999999' } });
    await screen.findByText(/CEP não encontrado/);
    fireEvent.change(screen.getByLabelText(/^Rua/), { target: { value: 'Rua digitada' } });
    fireEvent.change(screen.getByLabelText(/^Número \*/), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Complemento/), { target: { value: 'Bloco A' } });
    fireEvent.change(cep, { target: { value: '50000-000' } });
    await screen.findByText(/Não foi possível consultar o CEP/);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
    for (const value of ['Rua digitada', '12', 'Bloco A']) expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.queryByText(/Cartão SUS/)).toBeNull();
  });

  it.each(['clínica', 'profissional administrativo', 'profissional de saúde', 'estudante / estagiário'])(
    'mantém o endereço completo e a revisão para %s', async profile => {
      openRegistration();
      fireEvent.click(screen.getByRole('button', { name: 'Equipe e instituições' }));
      fireEvent.click(screen.getByRole('button', { name: `Selecionar ${profile}` }));
      fillBasicData();
      expect(screen.queryByLabelText(/CEP|Cartão SUS/)).toBeNull();
      fireEvent.change(screen.getByLabelText(/Endereço completo/), { target: { value: 'Rua das Flores, 10, Recife' } });
      fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
      await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
      fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
      expect(screen.getByText('Rua das Flores, 10, Recife')).toBeInTheDocument();
    },
  );

  it('rejeita formatos inválidos e datas futuras, permitindo omitir respostas opcionais', () => {
    const valid = { ...emptyBasicData, name: 'Maria Silva', cpf: '12345678900', birthDate: '2000-01-15', phone: '81999999999', email: 'maria@example.com', address: 'Rua das Flores, Recife' };
    expect(basicDataSchema.safeParse(valid).success).toBe(true);
    for (const invalid of [{ cpf: '123' }, { phone: 'abc81999999999' }, { email: 'invalido' }, { birthDate: '2999-01-01' }, { birthDate: '2001-02-30' }, { name: '   ' }]) {
      expect(basicDataSchema.safeParse({ ...valid, ...invalid }).success).toBe(false);
    }
  });
});

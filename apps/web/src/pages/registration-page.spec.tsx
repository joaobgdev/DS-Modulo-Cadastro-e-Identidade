import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(9));
    expect(screen.getByLabelText(/CPF/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados básicos' })).toBeInTheDocument();
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
    const cns = screen.getByLabelText(/Cartão SUS/);
    expect(cns).toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByText('Informe os 15 dígitos do Cartão SUS.');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados básicos' })).toBeInTheDocument();
    fireEvent.change(cns, { target: { value: '012abc3' } });
    expect(cns).toHaveValue('012 3');
    await waitFor(() => expect(cns).toHaveAttribute('aria-invalid', 'true'));
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByText('Informe os 15 dígitos do Cartão SUS.');
    fireEvent.change(screen.getByLabelText(/Cartão SUS/), { target: { value: '01234567890123456789' } });
    fireEvent.click(screen.getByLabelText('Sim', { selector: 'input[name="usesSocialName"]' }));
    fireEvent.change(screen.getByLabelText(/Como você prefere/), { target: { value: 'Mari' } });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await screen.findByRole('heading', { level: 1, name: 'Dados específicos' });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar dados' }));
    expect(screen.getByText('Mari')).toBeInTheDocument();
    const reviewSections = ['Dados pessoais', 'Formas de contato', 'Endereço'];
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(reviewSections);
    expect(within(screen.getByRole('region', { name: 'Dados pessoais' })).getByText('012 3456 7890 1234')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Formas de contato' })).getByText('(81) 99999-9999')).toBeInTheDocument();
    for (const value of ['50000-000', 'Rua das Flores Nova', 'S/N', '123.456.789-00']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    expect(screen.queryByText('Complemento')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '2. Dados básicos' }));
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Maria Silva');
    expect(screen.getByLabelText(/^Rua/)).toHaveValue('Rua das Flores Nova');
    expect(screen.getByLabelText(/^Número \*/)).toHaveValue('S/N');
    expect(screen.getByLabelText(/Cartão SUS/)).toHaveValue('012 3456 7890 1234');
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('(81) 99999-9999');
    expect(screen.getByLabelText(/CPF/)).toHaveValue('123.456.789-00');
    expect(screen.getByLabelText(/Como você prefere/)).toHaveValue('Mari');
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'invalido' } });
    fireEvent.click(screen.getByRole('button', { name: '4. Revisão' }));
    await screen.findByText('Informe um e-mail válido.');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados básicos' })).toBeInTheDocument();
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

  it('organiza a etapa em três seções e mantém o nome social condicional', () => {
    openRegistration(); startPatient();
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual([
      '1. Dados pessoais', '2. Formas de contato', '3. Endereço',
    ]);
    const personal = within(screen.getByRole('region', { name: '1. Dados pessoais' }));
    expect(personal.queryByLabelText(/Como você prefere/)).toBeNull();
    expect(personal.getAllByRole('radio').map(radio => radio.parentElement?.textContent))
      .toEqual(['Sim', 'Não', 'Prefiro não informar']);
    fireEvent.click(personal.getByRole('radio', { name: 'Sim' }));
    expect(personal.getAllByLabelText(/Nome completo|Como você prefere|Data de nascimento|CPF|Cartão SUS/)
      .map(input => input.getAttribute('name'))).toEqual(['name', 'socialName', 'birthDate', 'cpf', 'cns']);
    fireEvent.click(personal.getByRole('radio', { name: 'Não' }));
    expect(personal.queryByLabelText(/Como você prefere/)).toBeNull();
    for (const [name, expected] of [
      ['2. Formas de contato', ['email', 'phone']],
      ['3. Endereço', ['cep', 'street', 'houseNumber', 'complement']],
    ] as const) {
      expect(within(screen.getByRole('region', { name })).getAllByRole('textbox')
        .map(input => input.getAttribute('name'))).toEqual(expected);
    }
  });

  it('formata telefone fixo e celular durante a digitação e a colagem', () => {
    openRegistration(); startPatient();
    const phone = screen.getByLabelText(/Telefone/) as HTMLInputElement;
    for (const digit of '81999999999') {
      fireEvent.input(phone, { target: { value: phone.value + digit } });
    }
    expect(phone).toHaveValue('(81) 99999-9999');
    for (const [value, formatted] of [
      ['8133334444', '(81) 3333-4444'],
      ['(81) 3333-4444', '(81) 3333-4444'],
      ['a819876543210', '(81) 98765-4321'],
      ['(81) 98765-4321', '(81) 98765-4321'],
    ]) {
      fireEvent.input(phone, { inputType: 'insertFromPaste', target: { value } });
      expect(phone).toHaveValue(formatted);
    }
    fireEvent.input(phone, { target: { value: '(81) ' } });
    expect(phone).toHaveValue('(81');
    fireEvent.input(phone, { target: { value: '(8' } });
    expect(phone).toHaveValue('(8');
  });

  it('formata o Cartão SUS durante a digitação e a colagem com ou sem espaços', () => {
    openRegistration(); startPatient();
    const cns = screen.getByLabelText(/Cartão SUS/) as HTMLInputElement;
    for (const digit of '123456789012345') {
      fireEvent.input(cns, { target: { value: cns.value + digit } });
    }
    expect(cns).toHaveValue('123 4567 8901 2345');
    for (const value of ['012345678901234', '012 3456 7890 1234', 'a0123456789012345']) {
      fireEvent.input(cns, { inputType: 'insertFromPaste', target: { value } });
      expect(cns).toHaveValue('012 3456 7890 1234');
    }
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
    fireEvent.change(screen.getByLabelText(/Cartão SUS/), { target: { value: '123 4567 8901 2345' } });
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
    expect(screen.getByText('123 4567 8901 2345')).toBeInTheDocument();
  });

  it.each(['clínica', 'profissional administrativo', 'profissional de saúde', 'estudante / estagiário'])(
    'mantém o endereço completo e a revisão para %s', async profile => {
      openRegistration();
      fireEvent.click(screen.getByRole('button', { name: 'Equipe e instituições' }));
      fireEvent.click(screen.getByRole('button', { name: `Selecionar ${profile}` }));
      fillBasicData();
      fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: '81999999999' } });
      expect(screen.getByLabelText(/Telefone/)).toHaveValue('81999999999');
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

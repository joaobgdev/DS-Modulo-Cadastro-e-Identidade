import { useEffect, useRef, useState } from 'react';
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import type { BasicData } from './registration-model';

export function usePatientAddress(
  cep: string,
  getValues: UseFormGetValues<BasicData>,
  setValue: UseFormSetValue<BasicData>,
) {
  const automaticStreet = useRef('');
  const [result, setResult] = useState<{ cep: string; message: string }>();

  useEffect(() => {
    if (!/^\d{5}-\d{3}$/.test(cep)) return;

    const controller = new AbortController();
    const initialStreet = getValues('street');
    const isCurrent = () => !controller.signal.aborted && getValues('cep') === cep;
    const unavailable = 'Não foi possível consultar o CEP. Você pode preencher a rua.';
    const timeout = window.setTimeout(() => {
      if (isCurrent()) setResult({ cep, message: unavailable });
      controller.abort();
    }, 8000);

    async function lookup() {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`, { signal: controller.signal });
        if (!response.ok) throw new Error('Falha na consulta de CEP.');
        const data = await response.json();
        if (!isCurrent()) return;

        if (data.erro === true || data.erro === 'true') {
          setResult({ cep, message: 'CEP não encontrado. Confira o CEP ou preencha a rua.' });
          return;
        }

        const street = typeof data.logradouro === 'string' ? data.logradouro.trim() : '';
        if (street && getValues('street') === initialStreet && (!initialStreet || initialStreet === automaticStreet.current)) {
          setValue('street', street, { shouldValidate: true });
          automaticStreet.current = street;
        }
        setResult({ cep, message: street ? '' : 'Preencha a rua do seu endereço.' });
      } catch {
        if (isCurrent()) setResult({ cep, message: unavailable });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void lookup();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [cep, getValues, setValue]);

  return {
    message: result?.cep === cep ? result.message : '',
    markStreetEdited: () => { automaticStreet.current = ''; },
  };
}

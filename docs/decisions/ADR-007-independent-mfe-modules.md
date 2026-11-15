# ADR-007: Módulos funcionais independentes como MFEs

## Status
Aceito

## Contexto

A Clínica Digital UFPE reúne domínios funcionais desenvolvidos por times com
diferentes níveis de experiência e em diferentes fases de aprendizagem. Um
projeto único e fortemente acoplado faria com que uma decisão, uma falha de
ambiente ou um atraso de um time bloqueasse a evolução dos demais.

O Shell precisa oferecer uma experiência integrada, mas os domínios devem
preservar autonomia de desenvolvimento. Os módulos seguem a base de
[`clinicadigitalufpe_mfe`](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe_mfe).

## Decisão

Adotamos uma arquitetura composta por um Shell e módulos independentes
implementados como Micro Frontends (MFEs):

- o Shell hospeda a navegação, a composição da experiência e as integrações
  transversais;
- cada MFE possui seu próprio frontend, API, banco PostgreSQL, migrations,
  contrato e ciclo de entrega;
- a integração acontece por contratos explícitos e pontos de composição, não por
  acesso direto às implementações internas de outro módulo;
- cada MFE deve ser executável e testável isoladamente;
- as portas de desenvolvimento são reservadas e mantidas no
  [catálogo de módulos](../module-catalog.md);
- o módulo Exemplo Tarefas permanece no Shell para servir como referência
  pedagógica e não representa um domínio produtivo obrigatório.

## Consequências

### Positivas

- Times em aprendizagem podem desenvolver e validar seu domínio sem bloquear
  outros times.
- Falhas, mudanças e ciclos de entrega ficam limitados ao módulo afetado.
- Cada domínio pode evoluir com ownership claro de código, dados e pipeline.
- O Shell fornece uma entrada única para o usuário sem exigir um repositório
  monolítico.

### Negativas e mitigações

- A integração exige contratos, compatibilidade e coordenação de versões.
  Mitigação: documentar contratos e comunicar mudanças antes de remover
  compatibilidade.
- O desenvolvimento local usa mais processos e bancos. Mitigação: manter a
  convenção de portas documentada e scripts de setup por módulo.
- Observabilidade e autenticação precisam funcionar entre aplicações.
  Mitigação: definir padrões compartilhados na base `clinicadigitalufpe_mfe` e
  no Shell, sem acoplar o código interno dos módulos.

## Alternativas consideradas

1. **Monólito único:** rejeitado porque o acoplamento permitiria que o trabalho
   de um time bloqueasse o dos demais.
2. **Um monorepo com todos os domínios:** rejeitado como arquitetura de
   execução; pode facilitar compartilhamento, mas não garante autonomia de
   entrega e isolamento dos times.
3. **Aplicações totalmente independentes sem Shell:** rejeitado porque
   perderia a experiência integrada e a navegação centralizada.


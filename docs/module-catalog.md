# Catálogo de Módulos do Clínica Digital UFPE

O Shell é a aplicação hospedeira da Clínica Digital UFPE. Os domínios funcionais
são entregues como MFEs independentes, baseados na mesma fundação de
`clinicadigitalufpe_mfe`. Cada módulo pode evoluir, ser executado e ser validado
sem bloquear os demais times.

## Portas locais

As portas abaixo são a convenção do ambiente de desenvolvimento local. A primeira
porta é usada pelo frontend do MFE, a segunda pela API e a terceira pelo
PostgreSQL do módulo.

| Componente | Frontend | API | PostgreSQL |
| --- | ---: | ---: | ---: |
| Shell | 5173 | 3000 | 5432 |
| Agenda e fluxo assistencial | 5174 | 3001 | 5433 |
| Estoque e insumos | 5175 | 3002 | 5434 |
| Produção e BPA | 5176 | 3003 | 5435 |
| Gestão e indicadores | 5177 | 3004 | 5436 |
| Prontuário Comum, Modelagem Clínica e Processos | 5178 | 3005 | 5437 |
| Exemplo Tarefas | 5179 | 3009 | 5439 |
| Fichas Clínicas | 5180 | 3010 | 5440 |
| Telessaúde      | 5181 | 3011 | 5441 |

Cada MFE deve manter suas variáveis de ambiente, banco, migrations, contrato e
pipeline isolados. O Shell é responsável pela composição da experiência e pela
integração entre módulos; ele não deve copiar regras de negócio dos MFEs.

## Repositórios dos módulos

| Módulo | Repositório |
| --- | --- |
| Agenda e fluxo assistencial | [clinicadigitalufpe-agendamento](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-agendamento) |
| Estoque e insumos | [clinicadigitalufpe-estoque](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-estoque) |
| Produção e BPA | [clinicadigitalufpe-bpa](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-bpa) |
| Gestão e indicadores | [clinicadigitalufpe-indicadores](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-indicadores) |
| Prontuário Comum, Modelagem Clínica e Processos | [clinicadigitalufpe-prontuario](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-prontuario) |
| Fichas Clínicas | [clinicadigitalufpe-formularios](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-formularios) |
| Telessaúde | [clinicadigitalufpe-telessaude](https://gitlab.cin.ufpe.br/clinicadigitalufpe/clinicadigitalufpe-telessaude) |

O módulo Exemplo Tarefas permanece neste repositório como referência
pedagógica e técnica para novos times.

## Regras de integração

- O Shell deve consumir apenas os contratos e pontos de integração publicados
  pelo MFE.
- Alterações de contrato devem ser versionadas e comunicadas ao Shell e aos
  consumidores antes da remoção de compatibilidade.
- Um MFE deve continuar executável isoladamente para permitir aprendizagem,
  desenvolvimento e testes por time.
- O acesso local deve respeitar as portas reservadas acima; novos módulos
  precisam solicitar uma faixa livre antes de serem adicionados ao catálogo.


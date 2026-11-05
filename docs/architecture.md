# Arquitetura do Shell e dos MFEs

## Visão geral

O Shell da Clínica Digital UFPE é a aplicação hospedeira da plataforma e também
uma base pedagógica high-opinionated. Os domínios funcionais são desenvolvidos
como MFEs independentes para que os times possam aprender, entregar e testar
sem bloquear uns aos outros. A decisão está detalhada no
[ADR-007](decisions/ADR-007-independent-mfe-modules.md).

## Componentes principais

```text
Shell/
├── apps/api/ -> NestJS + Prisma + BFF de autenticação
└── apps/web/ -> React/Vite e composição do Shell

MFEs/
├── Agenda e fluxo assistencial
├── Estoque e insumos
├── Produção e BPA
├── Gestão e indicadores
├── Prontuário Comum, Modelagem Clínica e Processos
└── Fichas Clínicas
└── Telessaúde

infra local:
- PostgreSQL
- Keycloak
```

## Diagrama da composição

```text
┌────────────┐
│  Browser   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ React Web / Shell │
└─────┬──────┘
      │ /api
      ▼
┌─────────────────────┐
│ NestJS API / BFF    │
│ - sessão local      │
│ - RBAC              │
│ - ownership         │
└─────┬─────────┬─────┘
      │         │
      ▼         ▼
┌──────────┐  ┌────────────┐
│Keycloak  │  │ PostgreSQL │
└──────────┘  └────────────┘
```

Os MFEs são carregados pelo Shell por pontos de integração definidos. Cada um
mantém sua própria API e banco durante o desenvolvimento; o banco do Shell não
é compartilhado com os bancos dos domínios. As portas estão no
[catálogo de módulos](module-catalog.md).

## Decisões estruturais

### Banco
- PostgreSQL é o único banco padrão da baseline principal.
- O aluno não escolhe SQLite no fluxo principal.

### Persistência
- Prisma é a camada padrão da aplicação.
- Migrations são versionadas e executadas por script do template.

### Identidade
- Keycloak é o provedor padrão.
- O backend medeia o fluxo de autenticação.
- O frontend não depende de armazenar tokens OIDC.

### Sessão
- A aplicação mantém sessão local opaca por cookie `HttpOnly`.
- O cookie é a interface principal de autenticação usada pelo frontend.

### Autorização
- Papéis básicos vêm do provedor de identidade.
- Regras finas continuam no domínio da aplicação.

## Princípio pedagógico

O aluno deve conseguir responder estas perguntas rapidamente:
- onde fica a regra de negócio?
- onde fica a validação?
- onde fica a autorização?
- como o usuário autenticado chega ao service?

O aluno não precisa responder logo no início:
- como configurar um realm OIDC do zero?
- como desenhar toda a infraestrutura de autenticação?
- qual banco relacional escolher?

## Estado da implementação

A infraestrutura Docker de PostgreSQL + Keycloak, o provisionamento inicial de
identidade, a API/BFF OIDC e a sessão local opaca já estão disponíveis no
Shell. Os MFEs funcionais evoluem em repositórios próprios, seguindo a base
`clinicadigitalufpe_mfe`.

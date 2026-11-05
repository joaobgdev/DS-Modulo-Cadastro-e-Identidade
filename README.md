# 🏥 Módulo de Cadastro e Identidade — Clínica Digital UFPE

Este repositório contém o projeto para o módulo de **Cadastro e Identidade** do sistema Clínica Digital UFPE. O projeto fornece a estrutura central de rotas, autenticação integrada e layouts de interface para suportar a gestão de acessos e perfis da aplicação.

O objetivo principal deste módulo é gerir o fluxo completo de autenticação e registo de utilizadores com validação condicional por perfil (ex.: Médicos, Estudantes, Administradores), além do painel administrativo de aprovação de contas (`PENDING_APPROVAL`).

<br />

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript `>= 5.0`
* **Frontend:** React `>= 18.2` / Vite `>= 5.0` / Tailwind CSS `>= 3.4`
* **Backend / ORM:** Node.js (NestJS) / Prisma `>= 5.0`
* **Gerenciador de Pacotes:** `pnpm` `>= 8.0` (Ambiente Node.js `>= 18.0.0`)
* **Infraestrutura:** Docker (PostgreSQL & Keycloak)
* **Versionamento:** Git & GitHub

<br />

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter instalados na sua máquina:
* [Node.js](https://nodejs.org/) (Versão `>= 18.0.0` LTS recomendada)
* [pnpm](https://pnpm.io/) (`npm install -g pnpm@latest`)
* [Docker Desktop](https://www.docker.com/) (Para rodar PostgreSQL e Keycloak)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/joaobgdev/DS-Modulo-Cadastro-e-Identidade.git
   cd DS-Modulo-Cadastro-e-Identidade
   ```

2. **Instalar as dependências:**
   ```bash
   pnpm install
   ```

3. **Subir os serviços de infraestrutura (Banco & Auth):**
   ```bash
   pnpm auth:up
   ```

4. **Executar as migrações do banco de dados:**
   ```bash
   pnpm db:migrate
   ```

5. **Executar o ambiente de desenvolvimento:**
   ```bash
   pnpm dev
   ```

Aceder à aplicação no navegador em `http://localhost:5173` (Ou porta indicada no terminal).

<br />

## 🧪 Como Testar o Projeto

### Executar Todos os Testes
Para rodar a suíte completa de testes de todas as aplicações (`web` e `api`) de uma só vez a partir da raiz:

```bash
pnpm test
```

### Executar Testes por Aplicação
Se quiser rodar os testes apenas de um módulo específico, pode usar os filtros do `pnpm`:

```bash
# Apenas Frontend (apps/web)
pnpm --filter web test

# Apenas Backend (apps/api)
pnpm --filter api test
```

### Executar Testes End-to-End (E2E) na API
Para validar os fluxos completos de autenticação e rotas da API:

```bash
pnpm --filter api test:e2e
```

<br />

## 📂 Estrutura do Projeto

```text
DS-Modulo-Cadastro-e-Identidade/
├── apps/
│   ├── api/             # Backend em NestJS, Prisma ORM e rotas de autenticação (BFF)
│   └── web/             # Frontend em React (Vite, Tailwind CSS, TanStack Query)
├── docs/                # Guias de arquitetura, decisões (ADRs) e catálogo de módulos
├── infra/               # Infraestrutura local (Docker Compose, Keycloak, PostgreSQL)
├── openspec/            # Especificações técnicas e propostas de mudanças
├── scripts/             # Scripts automáticos de setup, migração e base de dados
├── compose.yaml         # Orquestração dos serviços (Keycloak, Postgres)
├── package.json         # Configuração raiz e scripts do workspace pnpm
├── pnpm-workspace.yaml  # Configuração do Monorepo pnpm
└── turbo.json           # Configuração de pipelines do Turborepo
```

<br />

## 🌿 Padronização de Git e Workflow

Para manter a organização do código, o grupo segue as seguintes convenções:

### Nomenclatura de Branches
* **`setup/...`**: Configurações base, infraestrutura ou dependências (ex.: `setup/initial-shell`).
* **`feature/...`**: Novas funcionalidades (ex.: ``).
* **`docs/...`**: Atualizar documentação do projeto (ex.: `docs/update-readme`).
* **`fix/...`**: Correção de erros e bugs (ex.: ``).

### Padronização de Commits (Conventional Commits)
As mensagens de commit devem ser escritas em inglês e seguir o formato:
* `setup:` para alterações em configurações e tarefas de build
* `feat:` para novas funcionalidades
* `docs:` para atualizações na documentação
* `fix:` para correções de bugs

<br />

## 👥 Equipe de Desenvolvimento

* **Caio Cesar** (`ccsl`) — Desenvolvedor(a)
* **João Bernardo** (`jbgac`) — Desenvolvedor(a)
* **João Lucas** (`jlbs2`) — Desenvolvedor(a)
* **Maria Luiza** (`mlpp`) — Desenvolvedor(a)
* **Matheus Luiz** (`mlts`) — Desenvolvedor(a)
* **Vicente Loureiro** (`vmpl`) — Desenvolvedor(a)

<br />

## 📄 Licença

Este projeto é desenvolvido para fins académicos no âmbito da disciplina de Desenvolvimento de Software na **Universidade Federal de Pernambuco (UFPE)**.

# 🏥 Módulo de Cadastro e Identidade — Clínica Digital UFPE

Este repositório contém o projeto para o módulo de **Cadastro e Identidade** do sistema da Clínica Digital UFPE. O objetivo principal deste módulo é gerenciar o fluxo completo de autenticação e registro de contas de utilizadores com validação condicional por perfil (ex.: Médicos, Estagiários, Administradores).

<br />

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript `>= 5.0`
* **Frontend:** React `>= 18.2` / Vite `>= 5.0` / Tailwind CSS `>= 3.4`
* **Backend / ORM:** Node.js (NestJS) / Prisma `>= 5.0`
* **Gerenciador de Pacotes:** `pnpm` `9.x` (Ambiente Node.js `>= 24`)
* **Infraestrutura:** Docker (PostgreSQL & Keycloak)
* **Versionamento:** Git & GitLab (CIn/UFPE)

<br />

## 📦 Como Executar o Projeto Localmente

### Passo 0 — Instalar os programas necessários

Programa - Versão exigida - Comando para conferir - Link para baixar
**Git** - Qualquer versão - `git --version` - https://git-scm.com/downloads
**Node.js** - **24 ou maior** - `node --version` deve mostrar `v24.x.x` - https://nodejs.org
**Docker Desktop** - Qualquer versão recente - `docker compose version` - https://www.docker.com/products/docker-desktop

Quem usa **Windows** ao instalar o Docker Desktop, deixe marcada a opção **"Use WSL 2"** e reinicie o computador se o instalador solicitar.

### Passo 1 — Baixar o projeto e o pnpm

Abra um terminal (no Windows, use **PowerShell** ou **Git Bash**). **Não abra como Administrador**: o terminal de administrador começa em `C:\Windows\system32`, e o projeto não deve ser baixado ali.

Antes de clonar, vá para uma pasta sua. Exemplos:

```bash
# Windows (PowerShell)
cd $HOME\Documents

# Linux / macOS / Git Bash
cd ~/Documents
```

Confira onde você está (o caminho **não** pode conter `system32`):

```bash
pwd
```

Agora baixe o projeto, uma linha de cada vez:

```bash
git clone https://gitlab.cin.ufpe.br/clinicadigitalufpe/cadastro/DS-Modulo-Cadastro-e-Identidade.git
cd DS-Modulo-Cadastro-e-Identidade
```

Confirme que o projeto veio completo:

```bash
ls -a        # Linux / macOS / Git Bash
dir -Force   # Windows PowerShell
```

Você deve ver `package.json`, `pnpm-lock.yaml` e `.env.example`. Se a pasta estiver vazia ou só tiver `.git`, o clone falhou: veja **Problemas comuns**.

**Instalar o pnpm 9.x**:

```bash
npm install -g pnpm@9
```

**Se o ao tentar fazer o clone aparecer o aviso `warning: missing OAuth configuration for gitlab.cin.ufpe.br - see https://aka.ms/gcm/gitlab for more information`, deve abrir uma janela do Git, insira suas credencias do Gitlab nessa janela para continuar o clone**
**Resultado esperado**: é criada a pasta `DS-Modulo-Cadastro-e-Identidade` e o terminal passa a estar dentro dela.
**Todos os comandos dos próximos passos devem ser rodados dentro dessa pasta.**

### Passo 2 — Checando as versões

```bash
node --version
pnpm --version
```

**Resultado esperado**:
* `node --version` mostra `v24.` seguido de números. Se mostrar outro número (ex.: `v18`, `v20`, `v22`), volte ao Passo 0 e instale o Node 24.
* `pnpm --version` mostra `9.` seguido de números. Se mostrar `10.x` ou `command not found`, veja **Problemas comuns**.

### Passo 3 — Instalar as dependências do projeto

```bash
pnpm install --frozen-lockfile
```

Essa instalação pode demorar alguns minutos

### Passo 4 — Criar o arquivo `.env`

**Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Windows CMD (Prompt de Comando):**
```bat
copy .env.example .env
```

Depois confira se deu certo:

```bash
pnpm run check:env
```

Deve retornar "Arquivo .env válido."

### Passo 5 — Abrir o Docker e confirmar que ele está funcionando

1. **Abra o programa Docker Desktop** e espere até ele mostrar que está rodando.
2. No terminal, rode:

```bash
docker info
```

Se aparecer algum erro, o Docker ainda não terminou de abrir. Espere um pouco e rode de novo ou veja **Problemas comuns** (na seção abaixo).

### Passo 6 — Subir banco de dados, Keycloak, migrations e seed

```bash
pnpm run setup
```

Não feche o terminal e não aperte `Ctrl+C` enquanto o comando não terminar de rodar.

### Passo 7 — Iniciar a aplicação

Quando o `pnpm run setup` terminar, execute:

```bash
pnpm dev
```

### Passo 8 — Abrir no navegador e entrar

1. Abra o navegador e acesse: **http://localhost:5173**
2. Entre com uma das contas de teste abaixo:

Perfil - E-mail - Senha
Administrador - `admin@appstart.local` - `ChangeMe123456!`
Usuário comum - `user@appstart.local` - `ChangeMe123456!`

### Como encerrar o programa

1. No terminal onde o `pnpm dev` está rodando, aperte `Ctrl+C`.
2. Para desligar o Docker:

```bash
pnpm auth:down
pnpm db:down
```

### Como rodar nas próximas vezes

Com o Docker Desktop aberto, dentro da pasta do projeto:

```bash
pnpm auth:up
pnpm dev
```

<br />

## 🩺 Problemas comuns

| Erro | Como resolver |
|------|---------------|
| O terminal está em `C:\Windows\system32` ou o clone ficou vazio | Você abriu o terminal como Administrador. Feche, abra um PowerShell normal, vá para uma pasta sua (`cd $HOME\Documents`) e clone de novo. Apague a pasta criada em `system32` |
| `pnpm install` diz `No package.json found` ou o `.env.example` não existe | Você não está dentro da pasta do projeto. Rode `dir -Force` e confirme que `package.json` aparece. Se baixou o zip, a pasta termina em `-main` e pode haver outra pasta dentro: entre até ver o `package.json` |
| `Arquivo .env não encontrado` | Faça o **Passo 4** |
| `Versão incompatível do Node.js` | Instale o Node **24** (https://nodejs.org). Se usa `nvm`: `nvm install 24` e depois `nvm use 24`. **Feche e abra o terminal** e rode `node --version` para conferir |
| `Versão incompatível do pnpm` (ex.: `10.x`) ou `pnpm: command not found` | Rode `corepack enable` e depois `corepack prepare pnpm@9.12.3 --activate`. Feche e abra o terminal e confira com `pnpm --version` |
| Ao executar comando pnpm aparece `pnpm : The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program.` | No Windows: execute o comando `npm prefix -g` e depois `$p=npm prefix -g;$u=[Environment]::GetEnvironmentVariable("Path","User");if($u-notlike"*$p*"){[Environment]::SetEnvironmentVariable("Path","$u;$p","User")}` |
| `Docker não está disponível` ou `Cannot connect to the Docker daemon` | Abra o Docker Desktop, espere ficar verde e rode `docker info` até funcionar. **Linux:** `sudo systemctl start docker` e, se der `permission denied`, rode `sudo usermod -aG docker $USER` e **saia e entre de novo na sessão** |
| `docker: 'compose' is not a docker command` | Instale/atualize o **Docker Desktop** (já inclui o Compose). No Linux, instale o pacote `docker-compose-plugin` |
| `port is already allocated` / `address already in use` na porta **5432** (PostgreSQL) | Pare o outro PostgreSQL **ou** abra o `.env` e troque `POSTGRES_PORT=5432` por `POSTGRES_PORT=5433` **e** troque também o `5432` dentro de `DATABASE_URL` por `5433`. Depois rode `pnpm run setup` de novo |
| `port is already allocated` na porta **8080** (Keycloak) | Feche o programa que usa a 8080 **ou** troque `KEYCLOAK_PORT=8080` por `KEYCLOAK_PORT=8081` no `.env` e rode `pnpm run setup` de novo |
| `A porta 3000 já está em uso para API` ou `A porta 5173 já está em uso para frontend` | Feche o outro terminal/programa. Para a API, você pode trocar `API_PORT` no `.env` |
| `Keycloak não ficou pronto dentro do tempo esperado` | Rode `docker compose logs keycloak` para ver o motivo e tente de novo com `pnpm auth:up` |
| Não consigo entrar com `admin@appstart.local` | Faça o **reset completo** abaixo |

### Reset completo (apaga TODOS os dados locais e recomeça do zero)

Use quando nada mais resolver. Com o Docker aberto, dentro da pasta do projeto:

```bash
docker compose down -v
pnpm run setup
pnpm dev
```

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
As mensagens de commit devem ser escritas em português e seguir o formato:
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

Este projeto é desenvolvido para fins acadêmicos da disciplina de Desenvolvimento de Software do **Centro de Informática (CIn)** da **Universidade Federal de Pernambuco (UFPE)**.

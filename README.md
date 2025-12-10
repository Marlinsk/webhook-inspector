# Webhook Inspector

Aplicação monorepo para capturar e inspecionar requisições de webhook.

## Estrutura do Projeto

Este é um monorepo pnpm workspace com dois pacotes:

- **[api/](api/)** - Backend Fastify com PostgreSQL/Drizzle ORM
- **[web/](web/)** - Frontend React com TanStack Router

## Pré-requisitos

- Node.js 18+
- pnpm 10.18.1+
- PostgreSQL (via Docker)

## Começando

### Instalação

```bash
# Instalar todas as dependências
pnpm install
```

### Configuração de Variáveis de Ambiente

Antes de iniciar o projeto, configure as variáveis de ambiente da API:

#### Desenvolvimento Local

```bash
cd api
cp .env.example .env.development
```

O arquivo `.env.development` deve conter:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5436/webhook_inspector
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_aqui
LOG_LEVEL=debug
```

**Como obter a chave do Google AI:**
1. Acesse [ai.google.dev](https://ai.google.dev/)
2. Crie uma API key
3. Adicione no arquivo `.env.development`

#### Produção

```bash
cd api
cp .env.example .env.production
```

Edite com suas credenciais do banco em nuvem:

```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://user:password@host:5432/webhook_inspector?sslmode=require
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_producao
LOG_LEVEL=info
```

**⚠️ Importante:** Use `sslmode=require` na connection string de produção.

Veja [api/README.md](api/README.md) para detalhes completos sobre variáveis de ambiente.

---

### Desenvolvimento

**Início rápido (recomendado):**
```bash
# Iniciar API e Web em paralelo (totalmente automático)
pnpm dev
```

A API agora inicia **automaticamente**:
- ✅ Container PostgreSQL (Docker)
- ✅ Migrations do banco de dados
- ✅ Seed com dados de exemplo
- ✅ Servidor em modo watch

**Comandos individuais:**
```bash
# Iniciar apenas a API (automático)
pnpm dev:api

# Iniciar apenas o Web
pnpm dev:web

# Apenas preparar ambiente (sem iniciar servidor)
pnpm setup
```

### Configuração do Banco de Dados

#### Desenvolvimento Local (Docker)

**Modo Automático (Recomendado):**

O comando `pnpm dev:api` já faz tudo automaticamente! Não é necessário configurar nada manualmente.

**Comandos Manuais (se necessário):**

```bash
# Gerar migrations (após alterações no schema)
pnpm db:generate

# Abrir Drizzle Studio (GUI do banco de dados)
pnpm db:studio
```

**Scripts internos da API** (geralmente não precisam ser executados manualmente):
```bash
cd api

# Apenas preparar ambiente
pnpm setup

# Iniciar apenas servidor (sem Docker/migrations)
pnpm dev:manual
```

#### Produção (Banco de Dados em Nuvem)

Para produção, use um provedor PostgreSQL em nuvem:

- **[Neon](https://neon.tech)** (Recomendado - Free tier generoso)
- **[Supabase](https://supabase.com)** (Free tier disponível)
- **[Railway](https://railway.app)** (Free tier com créditos)

Veja [api/README.md](api/README.md) para instruções detalhadas de configuração.

### Build

```bash
# Build de todos os pacotes
pnpm build

# Build limpo (limpa antes de compilar)
pnpm build:clean

# Build específico
pnpm build:api
pnpm build:web
```

### Verificação de Código

**Verificar tipos:**
```bash
# Verificar tipos em todos os pacotes
pnpm typecheck

# Verificar apenas API
pnpm typecheck:api
```

**Formatação:**
```bash
# Formatar automaticamente
pnpm format

# Apenas verificar formatação (sem alterar)
pnpm format:check

# Formatar específico
pnpm format:api
pnpm format:web
```

### Limpeza

```bash
# Limpar apenas builds
pnpm clean:dist

# Limpar tudo (node_modules + builds)
pnpm clean
```

## Arquitetura

### API

- **Framework**: Fastify com Zod type provider
- **Banco de dados**: PostgreSQL com Drizzle ORM
- **Porta**: 3333 (padrão)
- **Docs**: Documentação OpenAPI auto-gerada em `/docs`
- **Ambientes**: Desenvolvimento (Docker local) e Produção (banco de dados em nuvem)

### Web

- **Framework**: React 19 com TanStack Router
- **Estilização**: Tailwind CSS v4
- **Gerenciamento de Estado**: TanStack Query
- **Porta**: 5173 (padrão)

## Principais Funcionalidades

- **Captura de Webhooks**: Captura TODOS os métodos HTTP via rota wildcard `/capture/*`
- **Inspeção em Tempo Real**: Visualize detalhes do webhook incluindo headers, body e metadata
- **Segurança de Tipos**: Schemas Zod para validação em runtime e tipos TypeScript
- **Paginação por Cursor**: Paginação eficiente para listas de webhooks
- **Setup Automático**: Desenvolvimento totalmente automatizado (Docker + Migrations + Seed)
- **Multi-ambiente**: Suporte completo para desenvolvimento e produção

## Scripts do Monorepo

### Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia API e Web em paralelo (totalmente automático) |
| `pnpm dev:api` | Inicia apenas API (Docker + migrations + seed + servidor) |
| `pnpm dev:web` | Inicia apenas Web |
| `pnpm setup` | Prepara ambiente sem iniciar servidor |

### Build e Verificação

| Comando | Descrição |
|---------|-----------|
| `pnpm build` | Build de todos os pacotes |
| `pnpm build:clean` | Build limpo (limpa antes) |
| `pnpm build:api` | Build apenas da API |
| `pnpm build:web` | Build apenas do Web |
| `pnpm typecheck` | Verifica tipos em todos os pacotes |
| `pnpm typecheck:api` | Verifica tipos apenas na API |
| `pnpm format` | Formata código em todos os pacotes |
| `pnpm format:check` | Verifica formatação sem alterar |

### Produção

| Comando | Descrição |
|---------|-----------|
| `pnpm start` | Inicia API em produção |
| `pnpm start:prod` | Inicia API com NODE_ENV=production |

### Banco de Dados

| Comando | Descrição |
|---------|-----------|
| `pnpm db:generate` | Gera migrations (após alterar schema) |
| `pnpm db:studio` | Abre Drizzle Studio (GUI do banco) |

### Limpeza

| Comando | Descrição |
|---------|-----------|
| `pnpm clean:dist` | Limpa apenas builds |
| `pnpm clean` | Limpa tudo (node_modules + builds) |

## Configuração

### Configurações Compartilhadas

- **[biome.json](biome.json)** - Configuração Biome compartilhada para formatação de código
- **[tsconfig.base.json](tsconfig.base.json)** - Configuração TypeScript base compartilhada
- **[pnpm-workspace.yaml](pnpm-workspace.yaml)** - Configuração pnpm workspace

### Configurações Específicas por Pacote

Cada pacote estende as configurações compartilhadas com configurações específicas.

## Licença

ISC

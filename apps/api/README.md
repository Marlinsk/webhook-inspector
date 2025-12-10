# Webhook Inspector API

Backend API para capturar e inspecionar requisições de webhook.

## Tecnologias

- **Framework**: Fastify com Zod type provider
- **Banco de dados**: PostgreSQL com Drizzle ORM
- **Validação**: Zod para runtime validation e tipos TypeScript
- **IA**: Google Generative AI (Gemini)

## Configuração de Ambiente

### Variáveis de Ambiente

Antes de começar, você precisa configurar as variáveis de ambiente:

#### Para Desenvolvimento Local

Copie o arquivo de exemplo:

```bash
cp .env.example .env.development
```

Ou crie o arquivo `.env` manualmente com:

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
3. Adicione no `.env`

#### Para Produção

Copie o arquivo de exemplo de produção:

```bash
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

**⚠️ Importante para produção:**
- Use `sslmode=require` na connection string
- Nunca commite arquivos `.env` no Git

#### Referência de Variáveis

| Variável | Descrição | Obrigatória | Padrão |
|----------|-----------|-------------|---------|
| `NODE_ENV` | Ambiente de execução (development/production/test) | Não | `development` |
| `PORT` | Porta do servidor | Não | `3333` |
| `DATABASE_URL` | Connection string PostgreSQL | Sim | - |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Chave API do Google AI | Sim | - |
| `LOG_LEVEL` | Nível de log (debug/info/warn/error) | Não | `info` |

---

### Desenvolvimento (Local)

#### Modo Automático ⚡ (Recomendado)

O jeito mais rápido de começar! Execute um único comando:

```bash
pnpm dev
```

**O que acontece automaticamente:**
- ✅ Cria arquivo `.env` se não existir (baseado em `.env.development`)
- ✅ Inicia container PostgreSQL via Docker
- ✅ Aguarda banco ficar pronto (health check)
- ✅ Aplica migrations automaticamente
- ✅ Popula banco com dados de exemplo (seed)
- ✅ Inicia servidor em modo watch
- ✅ Encerra container ao sair (Ctrl+C)

O servidor estará rodando em `http://localhost:3333`

Documentação da API: `http://localhost:3333/docs`

**Conexão do banco:**
- Host: `localhost`
- Port: `5436`
- Database: `webhook_inspector`
- User: `docker`
- Password: `docker`

#### Modo Manual (Opcional)

Se preferir controlar cada etapa:

**1. Preparar ambiente sem iniciar servidor**

```bash
pnpm setup
```

Isso executa: Docker + migrations + seed (com prompt)

**2. Iniciar apenas o servidor**

```bash
pnpm dev:manual
```

**3. Comandos úteis do banco de dados**

```bash
# Gerar migrations (após alterações no schema)
pnpm db:generate

# Abrir Drizzle Studio (GUI do banco de dados)
pnpm db:studio
```

### Produção (Cloud Database)

#### 1. Configurar banco de dados em nuvem

Escolha um provedor PostgreSQL em nuvem (veja seção "Variáveis de Ambiente" acima):

**Neon** (Recomendado - Free tier generoso)
- Acesse [neon.tech](https://neon.tech)
- Crie um novo projeto
- Copie a connection string

**Supabase**
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Copie a connection string em Settings > Database

**Railway**
- Acesse [railway.app](https://railway.app)
- Adicione PostgreSQL ao projeto
- Copie a connection string

**⚠️ Lembre-se:** Adicione `?sslmode=require` no final da connection string!

#### 2. Executar migrations em produção

```bash
pnpm db:migrate:prod
```

#### 3. Build e start

```bash
# Build do projeto
pnpm build

# Iniciar em produção
pnpm start:prod
```

## Scripts Disponíveis

### Desenvolvimento

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | **[Automático]** Inicia tudo (Docker + migrations + seed + servidor) |
| `pnpm dev:manual` | Inicia apenas servidor em modo watch (sem Docker/migrations) |
| `pnpm dev:prod` | Inicia servidor em modo watch com env de produção |
| `pnpm setup` | Prepara ambiente sem iniciar servidor (Docker + migrations + seed) |

### Build e Produção

| Script | Descrição |
|--------|-----------|
| `pnpm build` | Compila TypeScript para JavaScript |
| `pnpm build:clean` | Limpa dist/ e compila novamente |
| `pnpm start` | Inicia servidor compilado |
| `pnpm start:prod` | Inicia servidor com NODE_ENV=production |

### Database

| Script | Descrição |
|--------|-----------|
| `pnpm db:generate` | Gera migrations do schema |
| `pnpm db:migrate` | Aplica migrations (dev) |
| `pnpm db:migrate:prod` | Aplica migrations (prod) |
| `pnpm db:studio` | Abre Drizzle Studio (GUI do banco) |
| `pnpm db:seed` | Popula banco com dados de exemplo (dev) |
| `pnpm db:seed:prod` | Popula banco com dados de exemplo (prod) |

### Formatação e Verificação

| Script | Descrição |
|--------|-----------|
| `pnpm format` | Formata código com Biome |
| `pnpm format:check` | Verifica formatação sem alterar |
| `pnpm typecheck` | Verifica tipos TypeScript |

## Estrutura do Banco de Dados

O schema do banco está em [src/db/schema/](src/db/schema/)

### Convenções

- **Naming**: `snake_case` (convenção Drizzle)
- **IDs**: UUIDv7 (time-sortable)
- **Timestamps**: `created_at`, `updated_at`

## API Endpoints

### Documentação Interativa

Acesse `http://localhost:3333/docs` para ver a documentação completa gerada automaticamente com Scalar.

### Principais Rotas

- `POST /capture/*` - Captura webhooks (qualquer método HTTP)
- `GET /webhooks` - Lista webhooks com paginação
- `GET /webhooks/:id` - Detalhes de um webhook
- `DELETE /webhooks/:id` - Deleta um webhook

## Segurança

### Produção

- ✅ SSL obrigatório para conexão com banco (`sslmode=require`)
- ✅ Validação de variáveis de ambiente com Zod
- ✅ CORS configurado
- ⚠️ Adicione rate limiting se expor para internet
- ⚠️ Configure autenticação para rotas administrativas

### Desenvolvimento

- Banco local sem SSL
- Logs detalhados habilitados
- Hot reload ativo

## Troubleshooting

### Erro: "Port 5436 already in use"

Outro serviço está usando a porta. Opções:

1. Parar o container existente: `docker compose -f api/docker-compose.yml down`
2. Verificar containers rodando: `docker ps`
3. Alterar porta no `docker-compose.yml` (e atualizar `DATABASE_URL` no `.env`)

### Erro: "Cannot connect to database"

O script `pnpm dev` gerencia o Docker automaticamente. Se houver problemas:

1. Verificar se Docker está instalado e rodando: `docker --version`
2. Executar manualmente: `docker compose -f api/docker-compose.yml up -d`
3. Verificar logs: `docker compose -f api/docker-compose.yml logs`
4. Verificar `DATABASE_URL` no `.env`

### Erro: "GOOGLE_GENERATIVE_AI_API_KEY is required"

Configure a chave da API do Google:

1. Acesse [ai.google.dev](https://ai.google.dev/)
2. Crie uma API key
3. Adicione no `.env`: `GOOGLE_GENERATIVE_AI_API_KEY=sua_chave`

### Scripts de automação não funcionam

Se `pnpm dev` ou `pnpm setup` não executarem:

1. Verificar permissões: `chmod +x api/scripts/*.sh`
2. Verificar se bash está disponível: `bash --version`
3. Usar modo manual: `pnpm dev:manual` (após preparar ambiente manualmente)

## Deployment

### Plataformas Recomendadas

**Render**
- Deploy automático via GitHub
- Free tier disponível
- Suporte nativo a Node.js

**Railway**
- Deploy via GitHub
- Free tier com $5 de crédito/mês
- PostgreSQL integrado

**Fly.io**
- Excelente performance
- Free tier generoso
- Deploy via CLI

### Checklist de Deploy

- [ ] Configurar `DATABASE_URL` com banco em nuvem
- [ ] Adicionar `?sslmode=require` na connection string
- [ ] Configurar `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Definir `NODE_ENV=production`
- [ ] Executar migrations: `pnpm db:migrate:prod`
- [ ] Build: `pnpm build`
- [ ] Configurar health check endpoint

## Licença

ISC

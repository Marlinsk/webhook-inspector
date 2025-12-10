# Scripts de Automação - Webhook Inspector API

Scripts bash para automatizar o setup e desenvolvimento do ambiente local.

## Scripts Disponíveis

### `dev.sh` - Desenvolvimento Completo (Recomendado)

Script principal que configura e inicia tudo automaticamente.

**O que faz:**
1. ✅ Verifica se `.env.development` existe
2. ✅ Inicia container PostgreSQL via Docker Compose
3. ✅ Aguarda banco ficar "healthy" (health check automático)
4. ✅ Aplica todas as migrations do Drizzle
5. ✅ Popula banco com dados de exemplo (seed)
6. ✅ Inicia servidor API em modo watch (hot reload) usando `.env.development`
7. ✅ Cleanup ao encerrar: para servidor e remove container

**Como usar:**
```bash
# Da raiz do monorepo
pnpm dev:api

# Ou da pasta api/
pnpm dev

# Ou diretamente
./scripts/dev.sh
```

**Ao pressionar Ctrl+C:**
- Servidor para automaticamente
- Container PostgreSQL é removido
- Recursos são liberados

---

### `setup-dev.sh` - Apenas Preparação do Ambiente

Script para preparar o ambiente sem iniciar o servidor. Útil quando você quer controlar quando o servidor inicia.

**O que faz:**
1. ✅ Verifica se `.env.development` existe
2. ✅ Inicia container PostgreSQL
3. ✅ Aguarda banco ficar "healthy"
4. ✅ Aplica migrations
5. ❓ Pergunta se deseja popular com seed (opcional)
6. ⏸️ Mantém container rodando até Ctrl+C

**Como usar:**
```bash
# Da raiz do monorepo
pnpm setup

# Ou da pasta api/
pnpm setup

# Ou diretamente
./scripts/setup-dev.sh
```

**Casos de uso:**
- Preparar ambiente para depois iniciar servidor manualmente (`pnpm dev:manual`)
- Usar Drizzle Studio para inspecionar o banco
- Rodar migrations manualmente ou testar queries
- Desenvolvimento com múltiplos servidores (API + outro processo)

---

## Comparação Rápida

| Característica | `dev.sh` | `setup-dev.sh` |
|----------------|----------|----------------|
| Verifica `.env.development` | ✅ Sim | ✅ Sim |
| Inicia Docker | ✅ Sim | ✅ Sim |
| Aplica Migrations | ✅ Automático | ✅ Automático |
| Popula Seed | ✅ Automático | ❓ Pergunta |
| Inicia Servidor | ✅ Automático | ❌ Manual |
| Remove Container ao sair | ✅ Sim | ✅ Sim |
| **Use quando** | Desenvolvimento normal | Controle manual do servidor |

## Pré-requisitos

- **Docker** instalado e rodando
- **pnpm** 10.18.1+ instalado
- **Node.js** 18+ instalado
- Estar na pasta `api/` (ou executar via workspace da raiz)

## Troubleshooting

### Erro: "Permission denied" ao executar scripts

```bash
# Tornar os scripts executáveis
chmod +x api/scripts/*.sh
```

### Erro: "Docker not running" ou "Cannot connect to Docker daemon"

```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Verificar se Docker está rodando
docker ps
```

### Erro: "Port 5436 already in use"

```bash
# Parar container existente
docker compose -f api/docker-compose.yml down

# Ver quem está usando a porta
lsof -i :5436

# Ou usar porta diferente no docker-compose.yml
```

### Container PostgreSQL não fica "healthy"

```bash
# Ver logs do PostgreSQL
docker compose -f api/docker-compose.yml logs postgres

# Seguir logs em tempo real
docker compose -f api/docker-compose.yml logs -f postgres

# Reiniciar container
docker compose -f api/docker-compose.yml restart postgres
```

### Variável de ambiente não encontrada

```bash
# Verificar se .env.development existe
ls -la api/.env.development

# Copiar do exemplo se não existir
cp api/.env.example api/.env.development

# Editar e configurar as variáveis (especialmente GOOGLE_GENERATIVE_AI_API_KEY)
nano api/.env.development
```

### Configurar variáveis de ambiente obrigatórias

O projeto usa arquivos de ambiente separados por contexto:
- **`.env.development`** - Ambiente de desenvolvimento local
- **`.env.production`** - Ambiente de produção
- **`.env.example`** - Template com todas as variáveis disponíveis

Ambos os arquivos precisam das seguintes variáveis:

**Obrigatórias:**
- `NODE_ENV` - Ambiente de execução (`development`, `production`, `test`)
- `PORT` - Porta do servidor API (padrão: `3333`)
- `DATABASE_URL` - Connection string do PostgreSQL
- `GOOGLE_GENERATIVE_AI_API_KEY` - Chave de API do Google Generative AI

**Opcional:**
- `LOG_LEVEL` - Nível de log (`debug`, `info`, `warn`, `error`) - padrão: `info`

**Como obter a chave da API do Google:**
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie ou use um projeto existente
3. Gere uma nova API key
4. Copie a chave e adicione no `.env`:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
   ```

**Exemplo de `.env.development` para desenvolvimento local:**
```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5436/webhook_inspector
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
LOG_LEVEL=info
```

**Exemplo de `.env.production` para produção:**
```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require&connection_limit=10
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
LOG_LEVEL=warn
```

## Dicas Úteis

### Usar com Drizzle Studio

```bash
# Terminal 1: Preparar ambiente
pnpm setup

# Terminal 2: Abrir Drizzle Studio (GUI do banco)
pnpm db:studio
```

### Resetar banco completamente

```bash
# Parar e remover volumes
docker compose -f api/docker-compose.yml down -v

# Recriar tudo
pnpm dev:api
```

### Desenvolvimento sem Docker (banco externo)

Se preferir usar banco em nuvem (Neon, Supabase, Railway):

1. Configure `DATABASE_URL` no `.env.development` com a connection string do provedor
2. Execute apenas migrations e servidor:
   ```bash
   cd api
   pnpm db:migrate
   pnpm dev:manual
   ```

### Ver todos os containers rodando

```bash
# Listar containers
docker ps

# Parar todos do projeto
docker compose -f api/docker-compose.yml down
```

## Perguntas Frequentes

**Q: O seed é idempotente? Posso rodar várias vezes?**
A: Não. O seed adiciona novos dados cada vez. Para resetar, use `docker compose down -v` e rode novamente.

**Q: As migrations são aplicadas automaticamente?**
A: Sim! Ambos scripts (`dev.sh` e `setup-dev.sh`) aplicam migrations automaticamente.

**Q: Posso usar estes scripts em produção?**
A: Não. Estes scripts são exclusivos para desenvolvimento local. Para produção, use `pnpm build` e `pnpm start:prod`.

**Q: Como atualizar o schema do banco?**
A: 1) Edite os arquivos em `src/db/schema/`, 2) Rode `pnpm db:generate` para criar a migration, 3) Reinicie o servidor (a migration será aplicada automaticamente).

**Q: O que acontece com meus dados ao reiniciar o script?**
A: Os dados persistem no volume Docker. Para limpar, use `docker compose down -v`.

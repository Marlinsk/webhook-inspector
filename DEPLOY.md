# Guia de Deploy - Webhook Inspector

Este guia explica como fazer deploy do projeto usando Turborepo com otimizações da Vercel.

## Arquitetura de Deploy

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │  Railway/Render  │
│   (Frontend)    │────────▶│  (Backend API)   │
│   apps/web/     │  proxy  │  apps/api/       │
└─────────────────┘         └──────────────────┘
```

## 1. Deploy da API (Backend)

A API Fastify precisa de um ambiente Node.js persistente. Escolha uma das opções:

### Opção A: Railway (Recomendado)

1. **Criar conta no Railway**: https://railway.app
2. **Novo Projeto** → **Deploy from GitHub repo**
3. **Configurações**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start:prod`
   - **Watch Paths**: `apps/api/**`

4. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   PORT=3333
   DATABASE_URL=postgresql://user:pass@host:5432/webhook_inspector?sslmode=require
   GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
   LOG_LEVEL=info
   ```

5. **Database PostgreSQL**:
   - Railway oferece PostgreSQL integrado
   - Ou use Neon/Supabase (free tier)

6. **Após Deploy**:
   - Anote a URL da API (ex: `https://webhook-inspect-api.up.railway.app`)
   - Execute migrations: `pnpm db:migrate:prod` (via Railway CLI ou dashboard)

### Opção B: Render

1. **Criar conta no Render**: https://render.com
2. **New Web Service** → Conectar repositório
3. **Configurações**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && cd apps/api && pnpm build`
   - **Start Command**: `cd apps/api && pnpm start:prod`
   - **Environment**: Node

4. Adicione as mesmas variáveis de ambiente

### Opção C: Fly.io

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Na raiz do projeto
cd apps/api

# Inicializar
fly launch

# Deploy
fly deploy
```

## 2. Deploy do Frontend (Vercel)

### Passo 1: Preparar Repositório

O projeto já está configurado com:
- ✅ `vercel.json` na raiz com Turborepo
- ✅ `.vercelignore` para otimizar build
- ✅ Remote caching habilitado no `turbo.json`

### Passo 2: Conectar na Vercel

1. **Acessar**: https://vercel.com/new
2. **Import Git Repository** → Selecione seu repo
3. **Configure Project**:

```
Framework Preset: Other
Root Directory: ./
Build Command: turbo build --filter=web
Output Directory: apps/web/dist
Install Command: pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

Na Vercel dashboard, adicione:

```
VITE_API_URL=deixe vazio (usa rewrites)
```

### Passo 4: Atualizar vercel.json do Web

Edite `apps/web/vercel.json` com a URL da sua API:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://sua-api-railway.up.railway.app/:path*"
    }
  ]
}
```

### Passo 5: Deploy

```bash
# Deploy via Git (automático)
git push origin main

# Ou via CLI
npx vercel --prod
```

## 3. Turborepo Remote Caching (Opcional)

O Remote Caching compartilha cache de builds entre desenvolvedores e CI/CD.

### Habilitar na Vercel

1. **Vercel Dashboard** → Settings → General
2. Copie o **Team ID**
3. Gere um **Token** em Account Settings → Tokens

### Configurar Localmente

```bash
# Login no Turborepo
npx turbo login

# Link ao projeto Vercel
npx turbo link
```

**Resultado**: Builds ficam ainda mais rápidos, reutilizando cache da Vercel! 🚀

### Verificar Cache

```bash
# Build com remote cache
pnpm build

# Você verá: "FULL TURBO" quando usar cache remoto
```

## 4. Monorepo na Vercel (Múltiplos Projetos)

Se quiser deploy separado de cada app:

### Web (Projeto 1)

```
Root Directory: ./
Build Command: turbo build --filter=web
Output Directory: apps/web/dist
```

### Docs/Admin (Projeto 2 - futuro)

```
Root Directory: ./
Build Command: turbo build --filter=docs
Output Directory: apps/docs/dist
```

**Vantagem**: Cada app tem seu próprio domínio e deployment independente.

## 5. Variáveis de Ambiente

### API (Railway/Render)

```bash
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://...
GOOGLE_GENERATIVE_AI_API_KEY=...
LOG_LEVEL=info
```

### Web (Vercel)

```bash
# Deixe vazio - usa rewrites
VITE_API_URL=
```

## 6. Banco de Dados em Produção

### Opção A: Neon (Recomendado)

- **Free tier**: 0.5 GB storage, 1 projeto
- **Serverless**: Auto-scaling
- **URL**: https://neon.tech

### Opção B: Supabase

- **Free tier**: 500 MB database, 2 GB transfer
- **Recursos extras**: Auth, Storage, Realtime
- **URL**: https://supabase.com

### Opção C: Railway PostgreSQL

- Integrado com a plataforma
- Free tier: $5/mês de créditos

### Executar Migrations

```bash
# Localmente (apontando para produção)
NODE_ENV=production pnpm db:migrate:prod

# Ou via Railway/Render terminal
pnpm db:migrate:prod
```

## 7. Verificação Pós-Deploy

### Checklist

- [ ] API está respondendo: `curl https://sua-api.railway.app/webhooks`
- [ ] Web está online: `https://seu-projeto.vercel.app`
- [ ] Proxy funcionando: `https://seu-projeto.vercel.app/api/webhooks`
- [ ] Database conectado e com schema atualizado
- [ ] Webhooks sendo capturados em `/api/capture/*`

### Testar Webhook

```bash
curl -X POST https://seu-projeto.vercel.app/api/capture/teste \
  -H "Content-Type: application/json" \
  -d '{"teste": "deploy funcionando"}'
```

Depois acesse a interface e veja o webhook capturado!

## 8. Troubleshooting

### Build falha na Vercel

**Erro**: `turbo: command not found`
- ✅ Solução: Vercel deve instalar automaticamente. Verifique se `turbo` está em `devDependencies` na raiz.

**Erro**: `Cannot find module '@webhook-inspect/shared-schemas'`
- ✅ Solução: O `pnpm install` deve rodar na raiz. Vercel faz isso automaticamente com workspaces.

### API não conecta ao banco

**Erro**: `Connection refused`
- ✅ Solução: Verifique `DATABASE_URL` nas variáveis de ambiente
- ✅ Certifique-se de usar `?sslmode=require` para Neon/Supabase

### Proxy não funciona

**Erro**: `404 Not Found` ao acessar `/api/webhooks`
- ✅ Solução: Verifique se `apps/web/vercel.json` tem a URL correta da API
- ✅ Certifique-se que a API está rodando

## 9. CI/CD com GitHub Actions (Bonus)

Crie `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Build
        run: pnpm build

      - name: Typecheck
        run: pnpm typecheck

      - name: Format check
        run: pnpm format:check
```

## 10. Custos Estimados

### Setup Gratuito

- **Frontend (Vercel)**: Free tier - 100 GB bandwidth
- **Backend (Railway)**: $5/mês em créditos (free tier)
- **Database (Neon)**: Free tier - 0.5 GB
- **Total**: ~$0/mês (dentro dos free tiers)

### Setup Escalável

- **Vercel Pro**: $20/mês - Custom domains, analytics
- **Railway Pro**: $20/mês - Mais recursos e uptime
- **Neon Scale**: $19/mês - 10 GB storage
- **Total**: ~$59/mês

---

## Resumo dos Comandos

```bash
# Local
pnpm dev              # Desenvolvimento
pnpm build            # Build completo
pnpm typecheck        # Verificar tipos

# Deploy
git push origin main  # Deploy automático Vercel
pnpm db:migrate:prod  # Migrations em produção

# Turborepo Remote Cache
npx turbo login       # Login Vercel
npx turbo link        # Conectar projeto
```

## Recursos

- 📚 [Vercel Turborepo Docs](https://vercel.com/docs/monorepos/turborepo)
- 🚀 [Railway Docs](https://docs.railway.app)
- 🐘 [Neon PostgreSQL](https://neon.tech/docs)
- ⚡ [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

#!/bin/bash

# Script de Desenvolvimento Completo
# Inicia tudo automaticamente: Docker + Migrations + Servidor

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Webhook Inspector - Dev Mode          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Função de limpeza
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando...${NC}"

    # Matar processo do servidor se estiver rodando
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi

    # Parar Docker
    echo -e "${BLUE}📦 Parando PostgreSQL...${NC}"
    sudo docker compose down

    echo -e "${GREEN}✅ Ambiente encerrado!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Verificar .env.development
echo -e "${BLUE}🔍 Verificando configuração...${NC}"
if [ ! -f .env.development ]; then
    echo -e "${RED}❌ Arquivo .env.development não encontrado!${NC}"
    echo -e "${YELLOW}💡 Copie o .env.example e configure as variáveis:${NC}"
    echo -e "   cp .env.example .env.development"
    exit 1
fi
echo -e "${GREEN}✅ Configuração OK${NC}"
echo ""

# 2. Iniciar Docker
echo -e "${BLUE}🐳 Iniciando PostgreSQL...${NC}"
sudo docker compose up -d

echo -e "${YELLOW}⏳ Aguardando PostgreSQL...${NC}"
sleep 3

# Aguardar health check
MAX_WAIT=30
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    if sudo docker compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ PostgreSQL pronto!${NC}"
        break
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [ $ELAPSED -eq $MAX_WAIT ]; then
    echo -e "${RED}❌ Timeout no PostgreSQL${NC}"
    exit 1
fi
echo ""

# 3. Migrations
echo -e "${BLUE}📊 Aplicando migrations...${NC}"
pnpm db:migrate
echo -e "${GREEN}✅ Migrations OK${NC}"
echo ""

# 4. Seed (automático na primeira vez)
echo -e "${BLUE}🌱 Verificando dados...${NC}"
# Verifica se já tem dados (simplificado)
pnpm db:seed 2>/dev/null || echo -e "${YELLOW}⏭️  Dados já existem ou erro no seed${NC}"
echo ""

# 5. Informações
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Ambiente Pronto!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🗄️  Database:${NC} localhost:5436/webhook_inspector"
echo -e "${BLUE}📖 Docs:${NC} http://localhost:3333/docs"
echo ""
echo -e "${YELLOW}🚀 Iniciando servidor...${NC}"
echo ""

# 6. Iniciar servidor
pnpm tsx watch --env-file=.env.development src/server.ts &
SERVER_PID=$!

# Aguardar servidor
wait $SERVER_PID

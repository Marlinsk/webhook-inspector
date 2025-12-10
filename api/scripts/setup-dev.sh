#!/bin/bash

# Script de Setup Automático - Ambiente de Desenvolvimento
# Este script configura e inicia todo o ambiente necessário

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Webhook Inspector - Setup Dev        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Função para limpar ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando ambiente...${NC}"

    echo -e "${BLUE}📦 Parando container PostgreSQL...${NC}"
    docker-compose down

    echo -e "${GREEN}✅ Ambiente encerrado com sucesso!${NC}"
    exit 0
}

# Registrar função de limpeza para SIGINT (Ctrl+C) e SIGTERM
trap cleanup SIGINT SIGTERM

# 1. Verificar se arquivo .env.development existe
echo -e "${BLUE}🔍 Verificando arquivo .env.development...${NC}"
if [ ! -f .env.development ]; then
    echo -e "${RED}❌ Arquivo .env.development não encontrado!${NC}"
    echo -e "${YELLOW}💡 Copie o .env.example e configure as variáveis:${NC}"
    echo -e "   cp .env.example .env.development"
    exit 1
else
    echo -e "${GREEN}✅ Arquivo .env.development encontrado!${NC}"
fi
echo ""

# 2. Iniciar container Docker
echo -e "${BLUE}🐳 Iniciando container PostgreSQL...${NC}"
docker-compose up -d

# Aguardar o banco ficar pronto
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
sleep 3

# Verificar health do container
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ PostgreSQL está pronto!${NC}"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Timeout aguardando PostgreSQL. Verifique os logs.${NC}"
        docker-compose logs
        exit 1
    fi

    sleep 1
done
echo ""

# 3. Executar migrations (apenas se necessário)
echo -e "${BLUE}📊 Aplicando migrations do banco de dados...${NC}"
pnpm db:migrate
echo -e "${GREEN}✅ Migrations aplicadas!${NC}"
echo ""

# 4. Popular banco com dados de exemplo (opcional)
echo -e "${YELLOW}❓ Deseja popular o banco com dados de exemplo? (s/N)${NC}"
read -t 10 -n 1 -r SEED_RESPONSE || SEED_RESPONSE="n"
echo ""

if [[ $SEED_RESPONSE =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}🌱 Populando banco com dados de exemplo...${NC}"
    pnpm db:seed
    echo -e "${GREEN}✅ Dados de exemplo inseridos!${NC}"
else
    echo -e "${YELLOW}⏭️  Pulando seed do banco${NC}"
fi
echo ""

# 5. Mostrar informações do ambiente
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Ambiente Pronto!                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Banco de Dados:${NC}"
echo -e "   Host: localhost"
echo -e "   Porta: 5436"
echo -e "   Database: webhook_inspector"
echo -e "   User: docker"
echo ""
echo -e "${GREEN}🚀 Para iniciar o servidor:${NC}"
echo -e "   ${YELLOW}pnpm dev${NC}"
echo ""
echo -e "${GREEN}📖 Outros comandos úteis:${NC}"
echo -e "   ${YELLOW}pnpm db:studio${NC}  - Abrir Drizzle Studio"
echo -e "   ${YELLOW}docker-compose logs -f${NC}  - Ver logs do PostgreSQL"
echo ""
echo -e "${BLUE}Pressione Ctrl+C para encerrar o ambiente${NC}"
echo ""

# Manter o script rodando
while true; do
    sleep 1
done

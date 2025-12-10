#!/bin/bash

# Script de desenvolvimento para o monorepo
# Inicia API e Web em paralelo com cleanup adequado

set -e -o pipefail

API_PID=""
WEB_PID=""

# Função de limpeza
cleanup() {
    # Matar processo do web silenciosamente
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi

    # Matar processo do API (o trap interno fará o cleanup do Docker)
    if [ ! -z "$API_PID" ] && kill -0 $API_PID 2>/dev/null; then
        kill -SIGINT $API_PID 2>/dev/null || true
        # Aguardar o script da API fazer o cleanup (com timeout)
        for i in {1..10}; do
            if ! kill -0 $API_PID 2>/dev/null; then
                break
            fi
            sleep 0.5
        done
    fi

    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar API em background (usando o script próprio da API)
(cd api && ./scripts/dev.sh) &
API_PID=$!

# Aguardar API estar pronta antes de iniciar o Web
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3333/docs > /dev/null 2>&1; then
        break
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [ $ELAPSED -eq $MAX_WAIT ]; then
    cleanup
fi

# Iniciar Web em background
(cd web && pnpm dev) &
WEB_PID=$!

# Aguardar qualquer processo finalizar
wait -n

# Se chegou aqui, algum processo morreu inesperadamente
cleanup

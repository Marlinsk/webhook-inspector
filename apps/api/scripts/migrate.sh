#!/bin/bash

# Carrega .env.development e executa migrations
set -a
source .env.development
set +a

drizzle-kit migrate

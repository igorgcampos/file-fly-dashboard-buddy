#!/bin/bash

# Script de Deploy para Produção
set -e

echo "🚀 Iniciando deploy da aplicação FTP Dashboard..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instale o Docker Compose primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover imagens antigas
echo "🧹 Removendo imagens antigas..."
docker system prune -f

# Construir novas imagens
echo "🔨 Construindo imagens..."
docker-compose build --no-cache

# Iniciar serviços
echo "▶️ Iniciando serviços..."
docker-compose up -d

# Verificar status
echo "📊 Verificando status dos serviços..."
docker-compose ps

echo "✅ Deploy concluído!"
echo "🌐 Frontend disponível em: http://localhost:3000"
echo "🔧 Backend API disponível em: http://localhost:8000"
echo "📚 Documentação da API: http://localhost:8000/docs" 
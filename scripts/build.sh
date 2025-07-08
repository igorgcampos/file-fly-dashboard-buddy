#!/bin/bash

# Script de Build - FTP Dashboard
set -e

echo "🔨 Build da aplicação FTP Dashboard"
echo "==================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se estamos no diretório correto
check_directory() {
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ Execute este script no diretório raiz do projeto${NC}"
        exit 1
    fi
}

# Função para limpar containers antigos
cleanup() {
    echo -e "${BLUE}🧹 Limpando containers antigos...${NC}"
    
    # Parar containers
    docker-compose down 2>/dev/null || true
    
    # Remover imagens antigas
    docker system prune -f
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Função para build das imagens
build_images() {
    echo -e "${BLUE}🔨 Construindo imagens...${NC}"
    
    # Build das imagens
    docker-compose build --no-cache
    
    echo -e "${GREEN}✅ Build concluído${NC}"
}

# Função para testar build
test_build() {
    echo -e "${BLUE}🧪 Testando build...${NC}"
    
    # Verificar se as imagens foram criadas
    if docker images | grep -q "file-fly-dashboard-buddy"; then
        echo -e "${GREEN}✅ Imagens criadas com sucesso${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro: Imagens não foram criadas${NC}"
        return 1
    fi
}

# Função principal
main() {
    echo -e "${BLUE}🔍 Verificando ambiente...${NC}"
    
    # Verificar diretório
    check_directory
    
    # Verificar se Docker está rodando
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker não está rodando${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ambiente OK${NC}"
    echo ""
    
    # Executar build
    cleanup
    build_images
    
    # Testar build
    if test_build; then
        echo ""
        echo -e "${GREEN}🎉 Build concluído com sucesso!${NC}"
        echo ""
        echo -e "${BLUE}📋 Próximos passos:${NC}"
        echo "   Para iniciar: ./scripts/deploy.sh"
        echo "   Para testar: ./scripts/test.sh"
        echo "   Para produção: ./scripts/deploy-prod.sh"
    else
        echo -e "${RED}❌ Build falhou${NC}"
        exit 1
    fi
}

# Executar função principal
main 
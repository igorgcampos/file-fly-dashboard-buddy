#!/bin/bash

# Script de Início Rápido - FTP Dashboard
# Faz TUDO automaticamente em uma máquina nova
set -e

echo "🚀 FTP Dashboard - Início Rápido"
echo "================================"

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
        echo "   (onde está o arquivo docker-compose.yml)"
        exit 1
    fi
}

# Função para instalar tudo
install_everything() {
    echo -e "${BLUE}📦 Instalando tudo automaticamente...${NC}"
    
    # Tornar scripts executáveis
    chmod +x scripts/*.sh
    
    # Executar instalação completa
    ./scripts/install-all.sh
}

# Função para fazer deploy
deploy_application() {
    echo -e "${BLUE}🚀 Fazendo deploy da aplicação...${NC}"
    
    # Executar deploy
    ./scripts/deploy.sh
}

# Função para testar
test_application() {
    echo -e "${BLUE}🧪 Testando aplicação...${NC}"
    
    # Aguardar um pouco para os serviços iniciarem
    echo "⏳ Aguardando serviços iniciarem..."
    sleep 30
    
    # Executar testes
    ./scripts/test.sh
}

# Função para mostrar informações finais
show_final_info() {
    echo ""
    echo -e "${GREEN}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}📋 Acessos:${NC}"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔧 Backend API: http://localhost:8000"
    echo "   📚 Documentação: http://localhost:8000/docs"
    echo "   📁 FTP Server: localhost:21"
    echo ""
    echo -e "${BLUE}👤 Usuário FTP padrão:${NC}"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo -e "${BLUE}🔧 Comandos úteis:${NC}"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Parar: docker-compose down"
    echo "   Reiniciar: docker-compose restart"
    echo "   Backup: ./scripts/backup.sh"
    echo "   Testar: ./scripts/test.sh"
    echo ""
    echo -e "${GREEN}✅ Tudo pronto! A aplicação está rodando.${NC}"
}

# Função principal
main() {
    echo -e "${BLUE}🔍 Verificando ambiente...${NC}"
    
    # Verificar diretório
    check_directory
    
    echo -e "${GREEN}✅ Diretório correto${NC}"
    echo ""
    
    # Perguntar se quer instalar tudo
    echo -e "${BLUE}📋 Este script vai:${NC}"
    echo "1. Instalar Docker e Docker Compose"
    echo "2. Instalar e configurar vsftpd"
    echo "3. Configurar firewall"
    echo "4. Fazer deploy da aplicação"
    echo "5. Testar se tudo está funcionando"
    echo ""
    
    read -p "Continuar com a instalação completa? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Instalação cancelada${NC}"
        exit 1
    fi
    
    # Executar todos os passos
    install_everything
    deploy_application
    test_application
    show_final_info
}

# Executar função principal
main 
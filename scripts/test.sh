#!/bin/bash

# Script de Teste - FTP Dashboard
set -e

echo "🧪 Testando aplicação FTP Dashboard"
echo "==================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar conectividade
test_connectivity() {
    local service=$1
    local port=$2
    local description=$3
    
    echo -n "🔍 Testando $description... "
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para testar API
test_api() {
    echo -n "🔍 Testando API... "
    
    if curl -s http://localhost:8000/ > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para testar FTP
test_ftp() {
    echo -n "🔍 Testando FTP... "
    
    # Testar conexão FTP
    if echo "QUIT" | nc localhost 21 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para testar containers
test_containers() {
    echo -n "🔍 Verificando containers... "
    
    if docker-compose ps 2>/dev/null | grep -q "Up"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para mostrar informações do sistema
show_system_info() {
    echo ""
    echo "📊 Informações do Sistema:"
    echo "=========================="
    
    echo "🖥️ Sistema Operacional:"
    cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2
    
    echo ""
    echo "🐳 Docker:"
    docker --version
    
    echo ""
    echo "🐙 Docker Compose:"
    docker-compose --version
    
    echo ""
    echo "📦 Containers:"
    docker-compose ps
    
    echo ""
    echo "🌐 Portas em uso:"
    netstat -tlnp | grep -E ":(21|3000|8000)" || echo "Nenhuma porta encontrada"
}

# Função para mostrar logs de erro
show_error_logs() {
    echo ""
    echo "📝 Últimos logs de erro:"
    echo "========================"
    
    echo "🔧 Backend logs:"
    docker-compose logs --tail=10 backend | grep -i error || echo "Nenhum erro encontrado"
    
    echo ""
    echo "🌐 Frontend logs:"
    docker-compose logs --tail=10 frontend | grep -i error || echo "Nenhum erro encontrado"
}

# Função principal
main() {
    echo "🚀 Iniciando testes..."
    
    # Verificar se estamos no diretório correto
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ Execute este script no diretório raiz do projeto${NC}"
        exit 1
    fi
    
    # Verificar se Docker está rodando
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando${NC}"
        exit 1
    fi
    
    # Array de testes
    tests=(
        "test_containers"
        "test_connectivity frontend 3000 'Frontend (porta 3000)'"
        "test_connectivity backend 8000 'Backend API (porta 8000)'"
        "test_connectivity ftp 21 'FTP Server (porta 21)'"
        "test_api"
    )
    
    # Executar testes
    passed=0
    total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        if eval $test; then
            ((passed++))
        fi
    done
    
    echo ""
    echo "📊 Resultado dos Testes:"
    echo "========================"
    echo -e "${GREEN}✅ Passou: $passed/$total${NC}"
    
    if [ $passed -eq $total ]; then
        echo -e "${GREEN}🎉 Todos os testes passaram! A aplicação está funcionando corretamente.${NC}"
    else
        echo -e "${RED}❌ Alguns testes falharam. Verifique os logs abaixo.${NC}"
        show_error_logs
    fi
    
    # Mostrar informações do sistema
    show_system_info
    
    echo ""
    echo "📋 Informações de Acesso:"
    echo "=========================="
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 Documentação: http://localhost:8000/docs"
    echo "📁 FTP Server: localhost:21"
    echo "👤 Usuário FTP padrão: admin/admin123"
    
    echo ""
    echo "🔧 Comandos úteis:"
    echo "=================="
    echo "Ver logs: docker-compose logs -f"
    echo "Reiniciar: docker-compose restart"
    echo "Parar: docker-compose down"
    echo "Backup: ./scripts/backup.sh"
}

# Executar função principal
main 
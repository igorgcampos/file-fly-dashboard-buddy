#!/bin/bash

# Script de Instalação Completa - FTP Dashboard
# Funciona em qualquer sistema Linux
set -e

echo "🚀 Instalação Completa do FTP Dashboard"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para detectar o sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$NAME
            VER=$VERSION_ID
        else
            OS=$(uname -s)
            VER=$(uname -r)
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="Windows"
    else
        OS="unknown"
    fi
    echo $OS
}

# Função para instalar dependências do sistema
install_system_deps() {
    echo -e "${BLUE}📦 Instalando dependências do sistema...${NC}"
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        echo "🔄 Atualizando repositórios..."
        sudo apt-get update
        
        echo "📦 Instalando dependências..."
        sudo apt-get install -y curl wget git build-essential net-tools
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        echo "📦 Instalando dependências..."
        sudo yum install -y curl wget git gcc net-tools
        
    elif [[ "$OS" == *"Amazon Linux"* ]]; then
        echo "📦 Instalando dependências..."
        sudo yum install -y curl wget git gcc net-tools
        
    else
        echo -e "${YELLOW}⚠️ Sistema não reconhecido, tentando instalar dependências básicas...${NC}"
        # Tentar instalar curl e wget
        sudo apt-get update 2>/dev/null || sudo yum update 2>/dev/null || true
        sudo apt-get install -y curl wget 2>/dev/null || sudo yum install -y curl wget 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Dependências do sistema instaladas${NC}"
}

# Função para instalar Docker
install_docker() {
    echo -e "${BLUE}🐳 Instalando Docker...${NC}"
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        echo "📦 Instalando Docker no Ubuntu/Debian..."
        
        # Remover versões antigas
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Instalar dependências
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Adicionar chave GPG oficial do Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Adicionar repositório
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Instalar Docker
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        
        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER
        
        # Habilitar e iniciar Docker
        sudo systemctl enable docker
        sudo systemctl start docker
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        echo "📦 Instalando Docker no CentOS/RHEL/Fedora..."
        
        # Instalar dependências
        sudo yum install -y yum-utils
        
        # Adicionar repositório
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        # Instalar Docker
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        
        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER
        
        # Habilitar e iniciar Docker
        sudo systemctl enable docker
        sudo systemctl start docker
        
    elif [[ "$OS" == *"Amazon Linux"* ]]; then
        echo "📦 Instalando Docker no Amazon Linux..."
        
        # Instalar Docker
        sudo yum install -y docker
        
        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER
        
        # Habilitar e iniciar Docker
        sudo systemctl enable docker
        sudo systemctl start docker
        
    else
        echo -e "${YELLOW}⚠️ Sistema não reconhecido, tentando instalar Docker via script oficial...${NC}"
        
        # Usar script oficial do Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        sudo systemctl enable docker
        sudo systemctl start docker
        rm get-docker.sh
    fi
    
    echo -e "${GREEN}✅ Docker instalado com sucesso${NC}"
}

# Função para instalar Docker Compose
install_docker_compose() {
    echo -e "${BLUE}🐙 Instalando Docker Compose...${NC}"
    
    # Baixar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo -e "${GREEN}✅ Docker Compose instalado com sucesso${NC}"
}

# Função para configurar firewall
setup_firewall() {
    echo -e "${BLUE}🔥 Configurando firewall...${NC}"
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # UFW
        if command -v ufw &> /dev/null; then
            sudo ufw allow 21/tcp
            sudo ufw allow 8000/tcp
            sudo ufw allow 3000/tcp
            sudo ufw allow 40000:40100/tcp
            echo -e "${GREEN}✅ Firewall configurado (UFW)${NC}"
        fi
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]] || [[ "$OS" == *"Amazon Linux"* ]]; then
        # firewalld
        if command -v firewall-cmd &> /dev/null; then
            sudo firewall-cmd --permanent --add-port=21/tcp
            sudo firewall-cmd --permanent --add-port=8000/tcp
            sudo firewall-cmd --permanent --add-port=3000/tcp
            sudo firewall-cmd --permanent --add-port=40000-40100/tcp
            sudo firewall-cmd --reload
            echo -e "${GREEN}✅ Firewall configurado (firewalld)${NC}"
        fi
    fi
}

# Função para criar usuário do sistema
create_system_user() {
    echo -e "${BLUE}👤 Criando usuário do sistema...${NC}"
    
    # Verificar se usuário já existe
    if ! id "ftpuser" &>/dev/null; then
        sudo useradd -m -s /bin/bash ftpuser
        echo -e "${GREEN}✅ Usuário ftpuser criado${NC}"
    else
        echo -e "${YELLOW}ℹ️ Usuário ftpuser já existe${NC}"
    fi
}

# Função para configurar SSL
setup_ssl() {
    echo -e "${BLUE}🔒 Configurando SSL...${NC}"
    
    # Criar diretório SSL
    mkdir -p ssl
    
    # Gerar certificado auto-assinado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || {
        echo -e "${YELLOW}⚠️ Não foi possível gerar certificado SSL (openssl não encontrado)${NC}"
    }
    
    echo -e "${GREEN}✅ SSL configurado${NC}"
}

# Função para verificar instalação
verify_installation() {
    echo -e "${BLUE}🔍 Verificando instalação...${NC}"
    
    # Verificar Docker
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker instalado${NC}"
    else
        echo -e "${RED}❌ Docker não encontrado${NC}"
        return 1
    fi
    
    # Verificar Docker Compose
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose instalado${NC}"
    else
        echo -e "${RED}❌ Docker Compose não encontrado${NC}"
        return 1
    fi
    
    # Verificar se Docker está rodando
    if docker info &> /dev/null; then
        echo -e "${GREEN}✅ Docker está rodando${NC}"
    else
        echo -e "${RED}❌ Docker não está rodando${NC}"
        return 1
    fi
    
    return 0
}

# Função principal
main() {
    echo -e "${BLUE}🔍 Detectando sistema operacional...${NC}"
    OS=$(detect_os)
    echo -e "${GREEN}🖥️ Sistema: $OS${NC}"
    
    # Verificar se é root
    if [ "$EUID" -eq 0 ]; then
        echo -e "${RED}❌ Não execute este script como root${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}📋 Passos da instalação:${NC}"
    echo "1. Instalar dependências do sistema"
    echo "2. Instalar Docker"
    echo "3. Instalar Docker Compose"
    echo "4. Configurar firewall"
    echo "5. Criar usuário do sistema"
    echo "6. Configurar SSL"
    echo "7. Verificar instalação"
    echo ""
    
    read -p "Continuar com a instalação? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Instalação cancelada${NC}"
        exit 1
    fi
    
    # Executar passos
    install_system_deps
    install_docker
    install_docker_compose
    setup_firewall
    create_system_user
    setup_ssl
    
    echo ""
    echo -e "${BLUE}🔄 Recarregando grupos do usuário...${NC}"
    newgrp docker || true
    
    # Verificar instalação
    if verify_installation; then
        echo ""
        echo -e "${GREEN}✅ Instalação do sistema concluída com sucesso!${NC}"
        echo ""
        echo -e "${BLUE}🚀 Agora execute o deploy:${NC}"
        echo "   ./scripts/deploy.sh"
        echo ""
        echo -e "${BLUE}📋 Informações importantes:${NC}"
        echo "   - Usuário FTP padrão: admin/admin123"
        echo "   - Porta FTP: 21"
        echo "   - Porta Web: 3000"
        echo "   - Porta API: 8000"
        echo "   - Diretório FTP: /home/ftpusers"
        echo ""
        echo -e "${GREEN}🎉 Tudo pronto! Execute o deploy para iniciar a aplicação.${NC}"
    else
        echo -e "${RED}❌ Instalação falhou. Verifique os erros acima.${NC}"
        exit 1
    fi
}

# Executar função principal
main 
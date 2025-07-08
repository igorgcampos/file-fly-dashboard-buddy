#!/bin/bash

# Script de Instalação Completa - FTP Dashboard
set -e

echo "🚀 Instalação Completa do FTP Dashboard"
echo "========================================"

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
    echo "📦 Instalando dependências do sistema..."
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt-get update
        sudo apt-get install -y curl wget git build-essential
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        sudo yum install -y curl wget git gcc
    elif [[ "$OS" == "macOS" ]]; then
        echo "🍎 Para macOS, instale o Docker Desktop: https://docs.docker.com/desktop/install/mac-install/"
        exit 1
    elif [[ "$OS" == "Windows" ]]; then
        echo "🪟 Para Windows, instale o Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    else
        echo "❌ Sistema operacional não suportado"
        exit 1
    fi
}

# Função para instalar Docker
install_docker() {
    echo "🐳 Instalando Docker..."
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Ubuntu/Debian
        echo "📦 Instalando Docker no Ubuntu/Debian..."
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker $USER
        sudo systemctl enable docker
        sudo systemctl start docker
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        # CentOS/RHEL/Fedora
        echo "📦 Instalando Docker no CentOS/RHEL/Fedora..."
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
    fi
    
    echo "✅ Docker instalado com sucesso!"
}

# Função para instalar Docker Compose
install_docker_compose() {
    echo "🐙 Instalando Docker Compose..."
    
    # Baixar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "✅ Docker Compose instalado com sucesso!"
}

# Função para configurar firewall
setup_firewall() {
    echo "🔥 Configurando firewall..."
    
    OS=$(detect_os)
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # UFW
        sudo ufw allow 21/tcp
        sudo ufw allow 8000/tcp
        sudo ufw allow 3000/tcp
        sudo ufw allow 40000:40100/tcp
        echo "✅ Firewall configurado (UFW)"
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        # firewalld
        sudo firewall-cmd --permanent --add-port=21/tcp
        sudo firewall-cmd --permanent --add-port=8000/tcp
        sudo firewall-cmd --permanent --add-port=3000/tcp
        sudo firewall-cmd --permanent --add-port=40000-40100/tcp
        sudo firewall-cmd --reload
        echo "✅ Firewall configurado (firewalld)"
    fi
}

# Função para criar usuário do sistema
create_system_user() {
    echo "👤 Criando usuário do sistema..."
    
    # Verificar se usuário já existe
    if ! id "ftpuser" &>/dev/null; then
        sudo useradd -m -s /bin/bash ftpuser
        echo "✅ Usuário ftpuser criado"
    else
        echo "ℹ️ Usuário ftpuser já existe"
    fi
}

# Função para baixar o projeto
download_project() {
    echo "📥 Baixando projeto..."
    
    # Se estamos no diretório do projeto, não baixar
    if [ -f "docker-compose.yml" ]; then
        echo "ℹ️ Projeto já existe no diretório atual"
        return
    fi
    
    # Aqui você pode adicionar o comando git clone se o projeto estiver em um repositório
    # git clone https://github.com/seu-usuario/file-fly-dashboard-buddy.git
    # cd file-fly-dashboard-buddy
    
    echo "⚠️ Por favor, clone o repositório manualmente ou copie os arquivos para este diretório"
    exit 1
}

# Função para configurar SSL (opcional)
setup_ssl() {
    echo "🔒 Configurando SSL..."
    
    # Criar diretório SSL
    mkdir -p ssl
    
    # Gerar certificado auto-assinado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"
    
    echo "✅ Certificado SSL gerado"
}

# Função principal
main() {
    echo "🔍 Detectando sistema operacional..."
    OS=$(detect_os)
    echo "🖥️ Sistema: $OS"
    
    # Verificar se é root
    if [ "$EUID" -eq 0 ]; then
        echo "❌ Não execute este script como root"
        exit 1
    fi
    
    echo ""
    echo "📋 Passos da instalação:"
    echo "1. Instalar dependências do sistema"
    echo "2. Instalar Docker"
    echo "3. Instalar Docker Compose"
    echo "4. Configurar firewall"
    echo "5. Criar usuário do sistema"
    echo "6. Baixar projeto"
    echo "7. Configurar SSL"
    echo "8. Deploy da aplicação"
    echo ""
    
    read -p "Continuar com a instalação? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Instalação cancelada"
        exit 1
    fi
    
    # Executar passos
    install_system_deps
    install_docker
    install_docker_compose
    setup_firewall
    create_system_user
    download_project
    setup_ssl
    
    echo ""
    echo "🔄 Recarregando grupos do usuário..."
    newgrp docker
    
    echo ""
    echo "✅ Instalação do sistema concluída!"
    echo ""
    echo "🚀 Agora execute o deploy:"
    echo "   ./scripts/deploy.sh"
    echo ""
    echo "📋 Informações importantes:"
    echo "   - Usuário FTP padrão: admin/admin123"
    echo "   - Porta FTP: 21"
    echo "   - Porta Web: 3000"
    echo "   - Porta API: 8000"
    echo "   - Diretório FTP: /home/ftpusers"
}

# Executar função principal
main 
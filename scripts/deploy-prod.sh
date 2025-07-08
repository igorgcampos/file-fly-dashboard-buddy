#!/bin/bash

# Script de Deploy para Produção
set -e

echo "🚀 Iniciando deploy de PRODUÇÃO da aplicação FTP Dashboard..."

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

# Função para instalar Docker no Linux
install_docker_linux() {
    echo "🐳 Instalando Docker..."
    
    # Detectar distribuição Linux
    if command -v apt-get &> /dev/null; then
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
        
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL/Fedora
        echo "📦 Instalando Docker no CentOS/RHEL/Fedora..."
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        
    else
        echo "❌ Distribuição Linux não suportada. Instale o Docker manualmente."
        exit 1
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

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker não está instalado. Instalando automaticamente..."
    
    OS=$(detect_os)
    echo "🖥️ Sistema operacional detectado: $OS"
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]] || [[ "$OS" == *"Linux"* ]]; then
        install_docker_linux
    elif [[ "$OS" == "macOS" ]]; then
        echo "🍎 Para macOS, instale o Docker Desktop: https://docs.docker.com/desktop/install/mac-install/"
        echo "💡 Ou use Homebrew: brew install --cask docker"
        exit 1
    elif [[ "$OS" == "Windows" ]]; then
        echo "🪟 Para Windows, instale o Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    else
        echo "❌ Sistema operacional não suportado. Instale o Docker manualmente."
        exit 1
    fi
    
    # Recarregar grupos do usuário
    echo "🔄 Recarregando grupos do usuário..."
    newgrp docker
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🐙 Docker Compose não está instalado. Instalando automaticamente..."
    install_docker_compose
fi

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Execute este script no diretório raiz do projeto (onde está o docker-compose.prod.yml)"
    exit 1
fi

# Verificar se o Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando. Iniciando Docker..."
    sudo systemctl start docker
    sleep 3
fi

# Configuração de produção
echo "⚙️ Configurando para produção..."

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se existe arquivo .env para produção
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env para produção..."
    cat > .env << EOF
# Configurações de Produção
ENVIRONMENT=production
NODE_ENV=production
EOF
    echo "✅ Arquivo .env criado"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remover imagens antigas
echo "🧹 Removendo imagens antigas..."
docker system prune -f

# Construir novas imagens
echo "🔨 Construindo imagens para produção..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar serviços de produção
echo "▶️ Iniciando serviços de produção..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar um pouco para os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 15

# Verificar status
echo "📊 Verificando status dos serviços..."
docker-compose -f docker-compose.prod.yml ps

# Verificar se os serviços estão rodando
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Deploy de PRODUÇÃO concluído com sucesso!"
    echo "🌐 Frontend disponível em: http://localhost (porta 80)"
    echo "🔧 Backend API disponível em: http://localhost:8000"
    echo "📚 Documentação da API: http://localhost:8000/docs"
    echo ""
    echo "🔒 Configurações de produção ativadas:"
    echo "   - SSL/HTTPS habilitado"
    echo "   - Rate limiting configurado"
    echo "   - Headers de segurança ativos"
    echo "   - Logs centralizados"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Parar: docker-compose -f docker-compose.prod.yml down"
    echo "   Reiniciar: docker-compose -f docker-compose.prod.yml restart"
    echo "   Backup: ./scripts/backup.sh"
else
    echo "❌ Erro: Alguns serviços não iniciaram corretamente."
    echo "📋 Verifique os logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi 
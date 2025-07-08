#!/bin/bash

# Script de inicialização para o container
set -e

echo "🚀 Iniciando FTP Dashboard..."

# Função para aguardar serviço
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Aguardando $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if pgrep -f $service > /dev/null; then
            echo "✅ $service está rodando"
            return 0
        fi
        
        echo "🔄 Tentativa $attempt/$max_attempts - $service ainda não está pronto..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service não iniciou após $max_attempts tentativas"
    return 1
}

# Função para configurar vsftpd se necessário
setup_vsftpd_if_needed() {
    echo "🔧 Verificando configuração do vsftpd..."
    
    # Sempre executar o setup para garantir que tudo está configurado
    echo "⚙️ Configurando vsftpd..."
    python setup_vsftpd.py
}

# Função para iniciar vsftpd
start_vsftpd() {
    echo "🐳 Iniciando vsftpd..."
    
    # Parar vsftpd se estiver rodando
    pkill vsftpd 2>/dev/null || true
    
    # Iniciar vsftpd em background
    vsftpd /etc/vsftpd/vsftpd.conf &
    
    # Aguardar vsftpd iniciar
    if wait_for_service vsftpd; then
        echo "✅ vsftpd iniciado com sucesso"
        return 0
    else
        echo "❌ Falha ao iniciar vsftpd"
        return 1
    fi
}

# Função para verificar portas
check_ports() {
    echo "🔍 Verificando portas..."
    
    # Aguardar um pouco para as portas ficarem disponíveis
    sleep 5
    
    # Verificar porta 21 (FTP)
    if netstat -tlnp 2>/dev/null | grep -q ":21 " || ss -tlnp 2>/dev/null | grep -q ":21 "; then
        echo "✅ Porta 21 (FTP) está aberta"
    else
        echo "❌ Porta 21 (FTP) não está aberta"
        return 1
    fi
    
    return 0
}

# Função principal
main() {
    echo "========================================"
    echo "🚀 Inicializando FTP Dashboard Container"
    echo "========================================"
    
    # Configurar vsftpd se necessário
    setup_vsftpd_if_needed
    
    # Iniciar vsftpd
    if ! start_vsftpd; then
        echo "❌ Falha ao iniciar vsftpd"
        exit 1
    fi
    
    # Verificar portas
    if ! check_ports; then
        echo "❌ Problema com portas, mas continuando para subir o backend..."
    fi
    
    echo ""
    echo "✅ Serviços do sistema iniciados com sucesso!"
    echo "🐳 vsftpd rodando na porta 21"
    echo ""
    
    # Iniciar aplicação FastAPI
    echo "🚀 Iniciando aplicação FastAPI..."
    echo "📊 API disponível em: http://localhost:8000"
    echo "📚 Documentação em: http://localhost:8000/docs"
    echo ""
    
    # Executar aplicação FastAPI
    exec python start.py
}

# Executar função principal
main 
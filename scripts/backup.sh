#!/bin/bash

# Script de Backup para FTP Dashboard
set -e

echo "💾 Iniciando backup da aplicação FTP Dashboard..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Criar diretório de backup
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Criando backup em: $BACKUP_DIR"

# Backup dos dados FTP
echo "📦 Fazendo backup dos dados FTP..."
docker run --rm \
    -v ftp_data:/data \
    -v "$(pwd)/$BACKUP_DIR:/backup" \
    alpine tar czf /backup/ftp_data_backup.tar.gz -C /data . 2>/dev/null || {
    echo "⚠️ Aviso: Não foi possível fazer backup dos dados FTP (volume pode não existir)"
}

# Backup das configurações do vsftpd
echo "⚙️ Fazendo backup das configurações..."
docker run --rm \
    -v vsftpd_config:/data \
    -v "$(pwd)/$BACKUP_DIR:/backup" \
    alpine tar czf /backup/vsftpd_config_backup.tar.gz -C /data . 2>/dev/null || {
    echo "⚠️ Aviso: Não foi possível fazer backup das configurações (volume pode não existir)"
}

# Backup dos logs
echo "📝 Fazendo backup dos logs..."
if [ -d "logs" ]; then
    tar czf "$BACKUP_DIR/logs_backup.tar.gz" logs/ 2>/dev/null || {
        echo "⚠️ Aviso: Não foi possível fazer backup dos logs"
    }
fi

# Backup do arquivo .env
echo "🔧 Fazendo backup das configurações de ambiente..."
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/"
fi

# Backup dos arquivos de configuração do projeto
echo "📋 Fazendo backup dos arquivos de configuração..."
tar czf "$BACKUP_DIR/config_backup.tar.gz" \
    docker-compose.yml \
    docker-compose.prod.yml \
    nginx.conf \
    nginx.prod.conf \
    backend/requirements.txt \
    backend/main.py \
    backend/start.py \
    backend/Dockerfile \
    Dockerfile \
    2>/dev/null || {
    echo "⚠️ Aviso: Alguns arquivos de configuração não foram encontrados"
}

# Criar arquivo de informações do backup
echo "📄 Criando arquivo de informações..."
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Backup FTP Dashboard
Data: $(date)
Versão: 1.0.0
Sistema: $(uname -s)
Arquivos incluídos:
- ftp_data_backup.tar.gz (dados FTP)
- vsftpd_config_backup.tar.gz (configurações)
- logs_backup.tar.gz (logs da aplicação)
- config_backup.tar.gz (arquivos de configuração)
- .env (variáveis de ambiente)

Para restaurar:
1. docker-compose down
2. docker volume rm ftp_data vsftpd_config
3. docker volume create ftp_data vsftpd_config
4. docker run --rm -v ftp_data:/data -v \$(pwd)/$BACKUP_DIR:/backup alpine tar xzf /backup/ftp_data_backup.tar.gz -C /data
5. docker run --rm -v vsftpd_config:/data -v \$(pwd)/$BACKUP_DIR:/backup alpine tar xzf /backup/vsftpd_config_backup.tar.gz -C /data
6. docker-compose up -d
EOF

# Verificar tamanho do backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ Backup concluído!"
echo "📊 Tamanho do backup: $BACKUP_SIZE"
echo "📁 Localização: $BACKUP_DIR"

# Listar arquivos do backup
echo ""
echo "📋 Arquivos do backup:"
ls -la "$BACKUP_DIR"

echo ""
echo "💡 Para restaurar este backup, use:"
echo "   ./scripts/restore.sh $BACKUP_DIR" 
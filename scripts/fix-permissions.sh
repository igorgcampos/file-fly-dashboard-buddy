#!/bin/bash

# Script para corrigir permissões
echo "🔧 Corrigindo permissões dos scripts..."

# Tornar todos os scripts executáveis
chmod +x scripts/*.sh

echo "✅ Permissões corrigidas!"
echo ""
echo "📋 Scripts disponíveis:"
echo "   ./scripts/quick-start.sh    - Instalação completa"
echo "   ./scripts/install-all.sh    - Instalação do sistema"
echo "   ./scripts/deploy.sh         - Deploy da aplicação"
echo "   ./scripts/build.sh          - Build das imagens"
echo "   ./scripts/test.sh           - Testar aplicação"
echo "   ./scripts/backup.sh         - Backup dos dados"
echo ""
echo "🚀 Agora você pode executar:"
echo "   ./scripts/deploy.sh" 
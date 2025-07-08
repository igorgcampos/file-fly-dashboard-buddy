# FTP Dashboard - Gerenciador de Servidor FTP

Uma aplicação web moderna para gerenciar servidores FTP com interface intuitiva e monitoramento em tempo real.

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** + **shadcn/ui** para UI
- **React Query** para gerenciamento de estado
- **React Router** para navegação

### Backend
- **FastAPI** (Python) para API REST
- **vsftpd** para servidor FTP
- **Arquivos de sistema** para armazenamento de dados

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)

## 🛠️ Instalação e Deploy

### Opção 1: Deploy com Docker (Recomendado)

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd file-fly-dashboard-buddy
```

2. **Deploy para Desenvolvimento**
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

3. **Deploy para Produção**
```bash
# Usar configuração de produção
docker-compose -f docker-compose.prod.yml up -d

# Ou usar o script de deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Opção 2: Desenvolvimento Local

1. **Backend**
```bash
cd backend
pip install -r requirements.txt
python start.py
```

2. **Frontend**
```bash
npm install
npm run dev
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **FTP Server**: Porta 21 (configurado via vsftpd)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Produção
ENVIRONMENT=production

# Desenvolvimento
NODE_ENV=development
```

### Configuração SSL (Produção)

1. **Gerar certificados SSL**
```bash
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

2. **Configurar domínio**
Edite `nginx.prod.conf` e substitua `server_name _;` pelo seu domínio.

## 📊 Funcionalidades

### Dashboard
- ✅ Estatísticas do servidor FTP
- ✅ Monitoramento de conexões ativas
- ✅ Uso de disco em tempo real
- ✅ Histórico de transferências

### Gerenciamento de Usuários
- ✅ Criar usuários FTP virtuais
- ✅ Definir quotas de disco
- ✅ Remover usuários
- ✅ Listar usuários ativos

### Monitoramento
- ✅ Status do servidor vsftpd
- ✅ Logs de transferências
- ✅ Usuários recentes
- ✅ Métricas de performance

## 🔒 Segurança

- **Rate Limiting**: Proteção contra ataques DDoS
- **CORS**: Configurado para produção
- **SSL/TLS**: Suporte completo a HTTPS
- **Headers de Segurança**: XSS, CSRF, etc.
- **Autenticação**: Sistema de usuários virtuais

## 📝 Logs

Os logs são salvos em:
- **Nginx**: `/var/log/nginx/`
- **Backend**: `./logs/`
- **Docker**: `docker-compose logs`

## 🚀 Deploy em Produção

### 1. **VPS/Cloud Server**

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy
git clone <seu-repositorio>
cd file-fly-dashboard-buddy
docker-compose -f docker-compose.prod.yml up -d
```

### 2. **Plataformas Cloud**

#### **Railway**
```bash
railway login
railway init
railway up
```

#### **Render**
```bash
# Conectar repositório no dashboard do Render
# Configurar build command: docker-compose -f docker-compose.prod.yml up -d
```

#### **DigitalOcean App Platform**
```bash
# Usar docker-compose.prod.yml
# Configurar variáveis de ambiente no dashboard
```

### 3. **AWS/GCP/Azure**

```bash
# Usar ECS, GKE ou AKS
# Configurar load balancer
# Configurar SSL certificates
```

## 🔧 Manutenção

### Backup
```bash
# Backup dos dados FTP
docker run --rm -v ftp_data:/data -v $(pwd):/backup alpine tar czf /backup/ftp_backup.tar.gz -C /data .

# Backup das configurações
docker run --rm -v vsftpd_config:/data -v $(pwd):/backup alpine tar czf /backup/vsftpd_config_backup.tar.gz -C /data .
```

### Updates
```bash
# Atualizar aplicação
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Monitoramento
```bash
# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Verificar uso de recursos
docker stats
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: Abra uma issue no GitHub
- **Documentação**: http://localhost:8000/docs (quando rodando)
- **Email**: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ usando React, FastAPI e Docker**

#!/usr/bin/env python3
"""
Script para instalar e configurar o vsftpd automaticamente
"""
import subprocess
import os
import sys
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command: str, check=True) -> tuple[bool, str]:
    """Execute system command and return success status and output"""
    try:
        logger.info(f"Executando: {command}")
        result = subprocess.run(command.split(), capture_output=True, text=True, timeout=60)
        if check and result.returncode != 0:
            logger.error(f"Comando falhou: {result.stderr}")
            return False, result.stderr
        return result.returncode == 0, result.stdout.strip()
    except subprocess.TimeoutExpired:
        logger.error("Comando expirou")
        return False, "Command timeout"
    except Exception as e:
        logger.error(f"Erro executando comando: {e}")
        return False, str(e)

def detect_package_manager():
    """Detect package manager"""
    if os.path.exists("/usr/bin/apt"):
        return "apt"
    elif os.path.exists("/usr/bin/yum"):
        return "yum"
    elif os.path.exists("/usr/bin/dnf"):
        return "dnf"
    elif os.path.exists("/usr/bin/pacman"):
        return "pacman"
    else:
        return None

def install_vsftpd():
    """Install vsftpd package"""
    logger.info("Instalando vsftpd...")
    
    pkg_manager = detect_package_manager()
    if not pkg_manager:
        logger.error("Gerenciador de pacotes não suportado")
        return False
    
    try:
        if pkg_manager == "apt":
            # Ubuntu/Debian
            logger.info("Instalando no Ubuntu/Debian...")
            success, _ = run_command("apt-get update")
            if not success:
                return False
            
            # Instalar vsftpd e dependências
            success, _ = run_command("apt-get install -y vsftpd db-util libpam-modules")
            if not success:
                return False
            
            # Verificar se vsftpd foi instalado
            success, _ = run_command("which vsftpd", check=False)
            if not success:
                logger.error("vsftpd não foi instalado corretamente")
                return False
            
            return True
            
        elif pkg_manager in ["yum", "dnf"]:
            # CentOS/RHEL/Fedora
            logger.info("Instalando no CentOS/RHEL/Fedora...")
            success, _ = run_command(f"{pkg_manager} install -y vsftpd db4-utils")
            return success
            
        elif pkg_manager == "pacman":
            # Arch Linux
            logger.info("Instalando no Arch Linux...")
            success, _ = run_command("pacman -S --noconfirm vsftpd db")
            return success
        
        return False
    except Exception as e:
        logger.error(f"Erro durante instalação: {e}")
        return False

def create_vsftpd_config():
    """Create vsftpd configuration file"""
    logger.info("Criando configuração do vsftpd...")
    
    config_content = """# vsftpd configuration for virtual users
# General settings
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
allow_writeable_chroot=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd

# Virtual users
guest_enable=YES
guest_username=ftpuser
user_sub_token=$USER
local_root=/home/ftpusers/$USER
virtual_use_local_privs=YES
userlist_enable=YES
userlist_file=/etc/vsftpd/virtual_users.txt
userlist_deny=NO

# Logging
xferlog_file=/var/log/vsftpd.log
xferlog_std_format=YES
log_ftp_protocol=YES

# Security
pasv_enable=YES
pasv_min_port=40000
pasv_max_port=40100
port_enable=YES

# Performance
max_clients=50
max_per_ip=10
"""
    
    try:
        # Criar diretório de configuração
        os.makedirs("/etc/vsftpd", exist_ok=True)
        
        # Escrever arquivo de configuração
        with open("/etc/vsftpd/vsftpd.conf", "w") as f:
            f.write(config_content)
        
        logger.info("Configuração do vsftpd criada com sucesso")
        return True
    except Exception as e:
        logger.error(f"Erro criando configuração: {e}")
        return False

def setup_ftp_user():
    """Create ftpuser and setup directories"""
    logger.info("Configurando usuário FTP...")
    
    try:
        # Criar usuário ftpuser se não existir
        success, _ = run_command("id ftpuser", check=False)
        if not success:
            run_command("useradd -m -s /bin/false ftpuser")
        
        # Criar diretórios
        os.makedirs("/home/ftpusers", exist_ok=True)
        os.makedirs("/var/run/vsftpd/empty", exist_ok=True)
        
        # Definir permissões
        run_command("chown ftpuser:ftpuser /home/ftpusers")
        run_command("chmod 755 /home/ftpusers")
        
        # Criar arquivo de usuários virtuais vazio
        with open("/etc/vsftpd/virtual_users.txt", "w") as f:
            f.write("")
        
        run_command("chown ftpuser:ftpuser /etc/vsftpd/virtual_users.txt")
        run_command("chmod 600 /etc/vsftpd/virtual_users.txt")
        
        logger.info("Usuário FTP configurado com sucesso")
        return True
    except Exception as e:
        logger.error(f"Erro configurando usuário FTP: {e}")
        return False

def setup_pam():
    """Setup PAM configuration for virtual users"""
    logger.info("Configurando PAM...")
    
    # Detectar arquitetura para o caminho correto do PAM
    import platform
    arch = platform.machine()
    
    if arch == "x86_64":
        pam_path = "/lib/x86_64-linux-gnu/security/pam_userdb.so"
    elif arch == "aarch64":
        pam_path = "/lib/aarch64-linux-gnu/security/pam_userdb.so"
    elif arch == "armv7l":
        pam_path = "/lib/arm-linux-gnueabihf/security/pam_userdb.so"
    else:
        # Fallback para outras arquiteturas
        pam_path = "/lib/security/pam_userdb.so"
    
    # Verificar se o arquivo PAM existe
    if not os.path.exists(pam_path):
        logger.warning(f"PAM module não encontrado em {pam_path}, tentando alternativas...")
        # Tentar encontrar o arquivo PAM
        possible_paths = [
            "/lib/x86_64-linux-gnu/security/pam_userdb.so",
            "/lib/aarch64-linux-gnu/security/pam_userdb.so",
            "/lib/arm-linux-gnueabihf/security/pam_userdb.so",
            "/lib/security/pam_userdb.so",
            "/usr/lib/x86_64-linux-gnu/security/pam_userdb.so",
            "/usr/lib/aarch64-linux-gnu/security/pam_userdb.so"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                pam_path = path
                logger.info(f"PAM module encontrado em: {pam_path}")
                break
        else:
            logger.error("PAM module não encontrado. Instalando libpam-modules...")
            run_command("apt-get install -y libpam-modules", check=False)
    
    pam_content = f"""#%PAM-1.0
auth required {pam_path} db=/etc/vsftpd/virtual_users
account required {pam_path} db=/etc/vsftpd/virtual_users
"""
    
    try:
        # Criar arquivo PAM
        with open("/etc/pam.d/vsftpd", "w") as f:
            f.write(pam_content)
        
        logger.info("PAM configurado com sucesso")
        return True
    except Exception as e:
        logger.error(f"Erro configurando PAM: {e}")
        return False

def create_sample_user():
    """Create a sample FTP user"""
    logger.info("Criando usuário de exemplo...")
    
    try:
        # Adicionar usuário de exemplo
        with open("/etc/vsftpd/virtual_users.txt", "w") as f:
            f.write("admin\nadmin123\n")
        
        # Criar diretório do usuário
        os.makedirs("/home/ftpusers/admin", exist_ok=True)
        run_command("chown ftpuser:ftpuser /home/ftpusers/admin")
        run_command("chmod 755 /home/ftpusers/admin")
        
        # Criar arquivo de banco de dados
        run_command("db_load -T -t hash -f /etc/vsftpd/virtual_users.txt /etc/vsftpd/virtual_users.db")
        run_command("chown ftpuser:ftpuser /etc/vsftpd/virtual_users.db")
        run_command("chmod 600 /etc/vsftpd/virtual_users.db")
        
        logger.info("Usuário de exemplo criado: admin/admin123")
        return True
    except Exception as e:
        logger.error(f"Erro criando usuário de exemplo: {e}")
        return False

def enable_and_start_vsftpd():
    """Enable and start vsftpd service"""
    logger.info("Iniciando serviço vsftpd...")
    
    try:
        # Habilitar serviço
        run_command("systemctl enable vsftpd")
        
        # Iniciar serviço
        success, _ = run_command("systemctl start vsftpd")
        if not success:
            logger.error("Falha ao iniciar vsftpd")
            return False
        
        # Verificar status
        success, output = run_command("systemctl is-active vsftpd")
        if success and "active" in output:
            logger.info("vsftpd iniciado com sucesso")
            return True
        else:
            logger.error("vsftpd não está rodando")
            return False
            
    except Exception as e:
        logger.error(f"Erro iniciando vsftpd: {e}")
        return False

def main():
    """Main installation function"""
    logger.info("=== Instalação e Configuração do vsftpd ===")
    
    # Verificar se é root
    if os.geteuid() != 0:
        logger.error("Este script deve ser executado como root")
        sys.exit(1)
    
    steps = [
        ("Instalando vsftpd", install_vsftpd),
        ("Criando configuração", create_vsftpd_config),
        ("Configurando usuário FTP", setup_ftp_user),
        ("Configurando PAM", setup_pam),
        ("Criando usuário de exemplo", create_sample_user),
        ("Iniciando serviço", enable_and_start_vsftpd),
    ]
    
    for step_name, step_func in steps:
        logger.info(f"--- {step_name} ---")
        if not step_func():
            logger.error(f"Falha em: {step_name}")
            sys.exit(1)
    
    logger.info("=== Instalação concluída com sucesso! ===")
    logger.info("Usuário de exemplo: admin/admin123")
    logger.info("Porta FTP: 21")
    logger.info("Diretório base: /home/ftpusers")

if __name__ == "__main__":
    main() 
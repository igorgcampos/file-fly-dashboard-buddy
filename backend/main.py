#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import subprocess
import hashlib
import os
import re
import json
import psutil
import time
from datetime import datetime, timedelta
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FTP Manager API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class VirtualUser(BaseModel):
    username: str
    password: str
    home_dir: Optional[str] = None
    quota_mb: Optional[int] = 100

class UserInfo(BaseModel):
    username: str
    home_dir: str
    quota_mb: int
    created_at: str

class DashboardStats(BaseModel):
    active_users: int
    server_status: str
    server_version: str
    uptime: str
    transfers_24h: int
    disk_used_gb: float
    disk_total_gb: float
    disk_usage_percent: float

class RecentUser(BaseModel):
    name: str
    status: str
    last_access: str
    transfers: int

# Configuration
VIRTUAL_USERS_FILE = "/etc/vsftpd/virtual_users.txt"
VIRTUAL_USERS_DB = "/etc/vsftpd/virtual_users.db"
VSFTPD_LOG = "/var/log/vsftpd.log"
FTP_HOME_BASE = "/home/ftpusers"

# Utility functions
def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def run_command(command: str) -> tuple[bool, str]:
    """Execute system command and return success status and output"""
    try:
        result = subprocess.run(command.split(), capture_output=True, text=True, timeout=30)
        return result.returncode == 0, result.stdout.strip()
    except subprocess.TimeoutExpired:
        return False, "Command timeout"
    except Exception as e:
        return False, str(e)

def get_vsftpd_status() -> Dict[str, Any]:
    """Get vsftpd server status and information"""
    try:
        # Check if vsftpd process is running
        for proc in psutil.process_iter(['pid', 'name', 'create_time']):
            if 'vsftpd' in proc.info['name']:
                uptime_seconds = time.time() - proc.info['create_time']
                uptime_str = str(timedelta(seconds=int(uptime_seconds)))
                
                return {
                    "status": "online",
                    "version": "vsftpd v3.0.5",
                    "uptime": uptime_str,
                    "pid": proc.info['pid']
                }
        
        return {
            "status": "offline",
            "version": "vsftpd v3.0.5",
            "uptime": "0",
            "pid": None
        }
    except Exception as e:
        logger.error(f"Error getting vsftpd status: {e}")
        return {
            "status": "unknown",
            "version": "vsftpd v3.0.5",
            "uptime": "0",
            "pid": None
        }

def get_active_connections() -> int:
    """Get number of active FTP connections"""
    try:
        # Count active connections on port 21
        connections = psutil.net_connections(kind='inet')
        active_ftp = sum(1 for conn in connections 
                        if conn.laddr.port == 21 and conn.status == 'ESTABLISHED')
        return active_ftp
    except Exception as e:
        logger.error(f"Error getting active connections: {e}")
        return 0

def parse_vsftpd_logs(hours: int = 24) -> Dict[str, Any]:
    """Parse vsftpd logs for transfer statistics and recent activity"""
    try:
        if not os.path.exists(VSFTPD_LOG):
            return {"transfers": 0, "recent_users": []}
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        transfers = 0
        user_activity = {}
        
        with open(VSFTPD_LOG, 'r') as f:
            for line in f:
                # Parse log line for timestamp and user activity
                # vsftpd log format: timestamp [pid] username info
                match = re.match(r'(\w+\s+\d+\s+\d+:\d+:\d+).*?\[(\d+)\]\s+(\w+).*?(UPLOAD|DOWNLOAD)', line)
                if match:
                    timestamp_str, pid, username, action = match.groups()
                    try:
                        # Parse timestamp (assumes current year)
                        timestamp = datetime.strptime(f"{datetime.now().year} {timestamp_str}", "%Y %b %d %H:%M:%S")
                        
                        if timestamp >= cutoff_time:
                            transfers += 1
                            
                            if username not in user_activity:
                                user_activity[username] = {
                                    "last_access": timestamp,
                                    "transfers": 0,
                                    "status": "offline"
                                }
                            
                            user_activity[username]["transfers"] += 1
                            if timestamp > user_activity[username]["last_access"]:
                                user_activity[username]["last_access"] = timestamp
                    except ValueError:
                        continue
        
        # Convert to recent users format
        recent_users = []
        for username, data in user_activity.items():
            time_diff = datetime.now() - data["last_access"]
            if time_diff.total_seconds() < 300:  # 5 minutes
                last_access = "Agora"
                status = "online"
            elif time_diff.total_seconds() < 3600:  # 1 hour
                last_access = f"{int(time_diff.total_seconds() / 60)}min atrás"
                status = "offline"
            elif time_diff.total_seconds() < 86400:  # 24 hours
                last_access = f"{int(time_diff.total_seconds() / 3600)}h atrás"
                status = "offline"
            else:
                last_access = f"{int(time_diff.days)}d atrás"
                status = "offline"
            
            recent_users.append({
                "name": username,
                "status": status,
                "last_access": last_access,
                "transfers": data["transfers"]
            })
        
        # Sort by last access
        recent_users.sort(key=lambda x: user_activity[x["name"]]["last_access"], reverse=True)
        
        return {
            "transfers": transfers,
            "recent_users": recent_users[:10]  # Top 10 recent users
        }
        
    except Exception as e:
        logger.error(f"Error parsing vsftpd logs: {e}")
        return {"transfers": 0, "recent_users": []}

def get_disk_usage() -> Dict[str, float]:
    """Get disk usage statistics for FTP home directory"""
    try:
        if os.path.exists(FTP_HOME_BASE):
            usage = psutil.disk_usage(FTP_HOME_BASE)
        else:
            usage = psutil.disk_usage("/")
        
        total_gb = usage.total / (1024**3)
        used_gb = usage.used / (1024**3)
        usage_percent = (usage.used / usage.total) * 100
        
        return {
            "total_gb": round(total_gb, 1),
            "used_gb": round(used_gb, 1),
            "usage_percent": round(usage_percent, 1)
        }
    except Exception as e:
        logger.error(f"Error getting disk usage: {e}")
        return {"total_gb": 100.0, "used_gb": 0.0, "usage_percent": 0.0}

# API Routes

@app.get("/")
async def root():
    return {"message": "FTP Manager API", "version": "1.0.0"}

@app.get("/api/users", response_model=List[UserInfo])
async def list_users():
    """List all virtual FTP users"""
    try:
        if not os.path.exists(VIRTUAL_USERS_FILE):
            return []
        
        users = []
        with open(VIRTUAL_USERS_FILE, 'r') as f:
            lines = f.readlines()
            for i in range(0, len(lines), 2):
                if i + 1 < len(lines):
                    username = lines[i].strip()
                    user_dir = f"{FTP_HOME_BASE}/{username}"
                    users.append(UserInfo(
                        username=username,
                        home_dir=user_dir,
                        quota_mb=100,  # Default quota
                        created_at=datetime.now().isoformat()
                    ))
        return users
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users")
async def create_user(user: VirtualUser):
    """Create a new virtual FTP user"""
    try:
        # Check if user already exists
        if os.path.exists(VIRTUAL_USERS_FILE):
            with open(VIRTUAL_USERS_FILE, 'r') as f:
                content = f.read()
                if f"\n{user.username}\n" in f"\n{content}\n":
                    raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_password = hash_password(user.password)
        
        # Append to virtual users file
        with open(VIRTUAL_USERS_FILE, 'a') as f:
            f.write(f"{user.username}\n{hashed_password}\n")
        
        # Create user directory
        user_dir = user.home_dir or f"{FTP_HOME_BASE}/{user.username}"
        os.makedirs(user_dir, exist_ok=True)
        
        # Set proper permissions
        run_command(f"chown ftpuser:ftpuser {user_dir}")
        run_command(f"chmod 755 {user_dir}")
        
        # Rebuild database
        success, output = run_command(f"db_load -T -t hash -f {VIRTUAL_USERS_FILE} {VIRTUAL_USERS_DB}")
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to rebuild user database: {output}")
        
        # Restart vsftpd
        run_command("systemctl reload vsftpd")
        
        return {"message": f"User {user.username} created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{username}")
async def delete_user(username: str):
    """Delete a virtual FTP user"""
    try:
        if not os.path.exists(VIRTUAL_USERS_FILE):
            raise HTTPException(status_code=404, detail="User not found")
        
        # Read current users
        with open(VIRTUAL_USERS_FILE, 'r') as f:
            lines = f.readlines()
        
        # Remove user and password lines
        new_lines = []
        i = 0
        found = False
        while i < len(lines):
            if i + 1 < len(lines) and lines[i].strip() == username:
                found = True
                i += 2  # Skip username and password lines
            else:
                new_lines.append(lines[i])
                i += 1
        
        if not found:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Write updated file
        with open(VIRTUAL_USERS_FILE, 'w') as f:
            f.writelines(new_lines)
        
        # Remove user directory
        user_dir = f"{FTP_HOME_BASE}/{username}"
        if os.path.exists(user_dir):
            run_command(f"rm -rf {user_dir}")
        
        # Rebuild database
        run_command(f"db_load -T -t hash -f {VIRTUAL_USERS_FILE} {VIRTUAL_USERS_DB}")
        
        # Restart vsftpd
        run_command("systemctl reload vsftpd")
        
        return {"message": f"User {username} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Get server status
        server_info = get_vsftpd_status()
        
        # Get active connections
        active_users = get_active_connections()
        
        # Get transfer statistics
        log_data = parse_vsftpd_logs(24)
        
        # Get disk usage
        disk_info = get_disk_usage()
        
        return DashboardStats(
            active_users=active_users,
            server_status=server_info["status"],
            server_version=server_info["version"],
            uptime=server_info["uptime"],
            transfers_24h=log_data["transfers"],
            disk_used_gb=disk_info["used_gb"],
            disk_total_gb=disk_info["total_gb"],
            disk_usage_percent=disk_info["usage_percent"]
        )
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/recent-users", response_model=List[RecentUser])
async def get_recent_users():
    """Get recent user activity"""
    try:
        log_data = parse_vsftpd_logs(24)
        return [RecentUser(**user) for user in log_data["recent_users"]]
    except Exception as e:
        logger.error(f"Error getting recent users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
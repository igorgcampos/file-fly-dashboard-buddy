FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    vsftpd \
    db-util \
    curl \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy startup script
#COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create FTP directories
RUN mkdir -p /home/ftpusers /etc/vsftpd /var/run/vsftpd/empty

# Expose ports
EXPOSE 8000 21

# Start both services
CMD ["/app/start.sh"] 
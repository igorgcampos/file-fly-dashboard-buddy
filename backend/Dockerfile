FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    vsftpd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create FTP directories
RUN mkdir -p /home/ftpusers /etc/vsftpd

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "start.py"] 
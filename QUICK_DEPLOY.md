# Quick Deploy Guide - Build Local & Push to Docker Hub

## Prerequisites
- Docker installed locally
- Docker Hub account (free at https://hub.docker.com)

## Step 1: Build và Push từ Local Machine

```bash
# Make script executable (first time only)
chmod +x build-and-push.sh

# Run build and push (replace with your Docker Hub username)
./build-and-push.sh your-dockerhub-username

# Script will:
# 1. Ask for Docker Hub login
# 2. Build client (npm install + npm run build)
# 3. Build server
# 4. Build Docker images
# 5. Push to Docker Hub
```

## Step 2: Deploy trên Server

### A. Copy docker-compose.prod.yml lên server

```bash
# Sửa YOUR_DOCKERHUB_USERNAME trong docker-compose.prod.yml
# Rồi copy lên server
scp docker-compose.prod.yml user@server:/path/to/project/docker-compose.yml
```

Hoặc sửa trực tiếp trên server:

```yaml
services:
  server:
    image: your-username/pg-server:latest  # Thay your-username
  client:
    image: your-username/pg-client:latest  # Thay your-username
```

### B. Pull và Run trên Server

```bash
# SSH vào server
ssh user@your-server

# Navigate to project
cd /path/to/project

# Pull images từ Docker Hub
docker compose pull

# Start services
docker compose up -d

# Check logs
docker compose logs -f
```

## Update Code Workflow

Mỗi khi có thay đổi code:

```bash
# 1. Local: Build và push mới
./build-and-push.sh your-dockerhub-username

# 2. Server: Pull và restart
ssh user@server "cd /path/to/project && docker compose pull && docker compose up -d"
```

## One-liner Update Command

Tạo alias để update nhanh:

```bash
# Thêm vào ~/.zshrc hoặc ~/.bashrc
alias deploy-pg='./build-and-push.sh your-username && ssh user@server "cd /path/to/project && docker compose pull && docker compose up -d"'

# Sau đó chỉ cần chạy:
deploy-pg
```

## Image Sizes

Expected sizes on Docker Hub:
- **Server**: ~200MB (Node + compiled code)
- **Client**: ~30MB (Nginx + static files)
- **Total**: ~230MB

Free Docker Hub tier: 1 private repo + unlimited public repos

## Troubleshooting

### "permission denied" khi push
```bash
docker login
# Enter Docker Hub username and password
```

### Client build fails locally
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Server không kết nối database
Check trong `docker-compose.prod.yml`:
- `DB_HOST` phải là `postgres` (tên service)
- `DB_PORT` phải là `5432` (internal port)

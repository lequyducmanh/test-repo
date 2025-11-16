# Deployment Guide

## Setup CI/CD with GitHub Actions

### 1. Add Docker Hub Secrets to GitHub

Go to your repository: Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### 2. Update docker-compose.yml on Server

```yaml
services:
  server:
    image: your-dockerhub-username/pg-server:latest
    # ... rest of config
  
  client:
    image: your-dockerhub-username/pg-client:latest
    # ... rest of config
```

### 3. Deploy Workflow

```bash
# 1. Make changes to code
git add .
git commit -m "Your changes"
git push origin main

# 2. GitHub Actions automatically:
#    - Builds Docker images
#    - Pushes to Docker Hub

# 3. On your server, pull and restart:
ssh your-server
cd /path/to/project
docker compose pull
docker compose up -d
```

## Manual Build (Alternative)

If you don't want to use CI/CD:

```bash
# On local machine
cd client
npm run build

# Build image with pre-built files
docker build -f Dockerfile.prod -t your-username/pg-client:latest .

# Push to registry
docker push your-username/pg-client:latest

# On server
docker pull your-username/pg-client:latest
docker compose up -d
```

## Auto-deploy Script for Server

Create `deploy.sh` on your server:

```bash
#!/bin/bash
cd /path/to/your/project
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
echo "Deployment completed at $(date)"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Then just run:
```bash
./deploy.sh
```

# Build & Deploy Instructions for Low-Spec Server (1 Core / 1GB RAM)

## Problem
Building the React client on a 1 core / 1GB RAM server is extremely slow or fails due to memory constraints.

## Solution: Build on CI/CD or Locally, Deploy to Server

### Deployment Workflow (Recommended)

The `dist/` folder is in `.gitignore` and won't be pushed to Git. Instead:

1. **Push code to Git** (without dist)
2. **CI/CD builds automatically** (GitHub Actions, GitLab CI, etc.)
3. **Deploy image to server** (via Docker Hub or container registry)

### Option 1: GitHub Actions CI/CD (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push client
        uses: docker/build-push-action@v4
        with:
          context: ./client
          file: ./client/Dockerfile
          push: true
          tags: your-username/pg-client:latest
      
      - name: Build and push server
        uses: docker/build-push-action@v4
        with:
          context: ./server
          file: ./server/Dockerfile
          push: true
          tags: your-username/pg-server:latest
```

Then on your server, just pull and run:

```bash
# On server
docker compose pull
docker compose up -d
```

### Option 2: Build Locally for Testing

If you need to test locally before deploying:

```yaml
client:
  build:
    context: ./client
    dockerfile: Dockerfile.prod  # Use the lightweight Dockerfile
  # ... rest of config
```

Then on server:

```bash
# Copy the entire project including dist folder to server
rsync -avz --exclude 'node_modules' ./ user@server:/path/to/project/

# On server, build only the client image (fast - just copies files)
docker compose build client

# Start services
docker compose up -d
```

#### Option B: Build Image Locally, Push to Registry

```bash
# On local machine
cd client
npm run build

# Build Docker image
docker build -f Dockerfile.prod -t your-registry/pg-client:latest .

# Push to Docker Hub or your registry
docker push your-registry/pg-client:latest

# On server, pull the image
docker pull your-registry/pg-client:latest
docker compose up -d
```

#### Option C: Direct rsync of dist folder

```bash
# On local machine, build first
cd client
npm run build

# Sync only dist folder to server
rsync -avz dist/ user@server:/path/to/project/client/dist/

# On server, rebuild client (will be very fast)
docker compose build client
docker compose up -d
```

## File Sizes Reference

- **With minification (default)**: ~500KB bundle
- **Without minification (current config)**: ~800KB bundle
- Both work fine, minification mainly saves bandwidth

## Troubleshooting

### If build still fails on server:
1. Make sure you're using `Dockerfile.prod` not `Dockerfile`
2. Verify `dist/` folder exists before building Docker image
3. Check `.dockerignore` doesn't exclude `dist/`

### If nginx shows 404:
1. Check nginx.conf configuration
2. Verify dist files are in `/usr/share/nginx/html` inside container:
   ```bash
   docker exec pg_client ls -la /usr/share/nginx/html
   ```

## Development Workflow

### For Development (on local machine):
```bash
docker compose -f docker-compose.dev.yml up
```

### For Production Deploy:
```bash
# Local
npm run build

# Server
rsync -avz dist/ server:/path/to/project/client/dist/
ssh server "cd /path/to/project && docker compose up -d --build client"
```

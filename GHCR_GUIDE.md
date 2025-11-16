# GitHub Container Registry (GHCR) Guide

## Ưu điểm so với Docker Hub

- ✅ **FREE unlimited private images** (không giới hạn private repos)
- ✅ **FREE unlimited storage**
- ✅ **FREE unlimited bandwidth**
- ✅ Tích hợp GitHub Actions (CI/CD tự động)
- ✅ Không cần tài khoản thêm (dùng GitHub account)

## Setup Guide

### 1. Tạo Personal Access Token (PAT)

1. Vào: https://github.com/settings/tokens/new
2. Token name: `Docker GHCR Access`
3. Expiration: `No expiration` (hoặc tùy chọn)
4. Select scopes:
   - ✅ `write:packages` - Push images
   - ✅ `read:packages` - Pull images
   - ✅ `delete:packages` - Delete images (optional)
5. Click **Generate token**
6. **Copy token và lưu lại** (chỉ hiện 1 lần)

### 2. Build và Push (Local Machine)

```bash
# Run script
./build-and-push-ghcr.sh your-github-username

# Script sẽ hỏi token, paste token vừa tạo
# (không hiển thị khi gõ - bình thường)
```

### 3. Deploy trên Server

#### A. Login trên Server

```bash
# SSH vào server
ssh user@your-server

# Login to GHCR (replace YOUR_TOKEN with actual token)
echo YOUR_TOKEN | docker login ghcr.io -u your-github-username --password-stdin
```

#### B. Copy docker-compose.ghcr.yml

```bash
# From local machine
scp docker-compose.ghcr.yml user@server:/path/to/project/docker-compose.yml
```

#### C. Pull và Run

```bash
# On server
cd /path/to/project
docker compose pull
docker compose up -d
```

## Với GitHub Actions (CI/CD Tự động)

Script `.github/workflows/deploy.yml` đã có sẵn sẽ tự động:
- Build khi push code
- Push lên GHCR
- Không cần chạy build local

Chỉ cần thêm secret `GITHUB_TOKEN` (tự động có sẵn trong Actions).

## Private vs Public Images

**Mặc định: Private** (chỉ bạn truy cập)

Để public (ai cũng pull được):
1. Vào: https://github.com/YOUR_USERNAME?tab=packages
2. Click vào package (pg-client hoặc pg-server)
3. Package settings → Change visibility → Public

## So sánh

| Feature | Docker Hub Free | GHCR |
|---------|----------------|------|
| Public repos | Unlimited | Unlimited |
| Private repos | 1 | **Unlimited** |
| Storage | Unlimited | Unlimited |
| Bandwidth | 200 pulls/6h | Unlimited |
| CI/CD integration | Cần config | **Built-in** |
| Cost | Free | **Free** |

## Troubleshooting

### "authentication required"
```bash
# Re-login với token mới
docker logout ghcr.io
echo YOUR_NEW_TOKEN | docker login ghcr.io -u username --password-stdin
```

### Không pull được trên server
- Check token có scope `read:packages`
- Nếu image là private, server phải login GHCR trước
- Hoặc đổi image sang public

### Token expired
- Tạo token mới với "No expiration"
- Hoặc dùng token 90 days và tạo lại định kỳ

## Commands Reference

```bash
# Login GHCR
echo TOKEN | docker login ghcr.io -u username --password-stdin

# Build & Push
./build-and-push-ghcr.sh your-username

# Pull specific image
docker pull ghcr.io/username/pg-server:latest

# List local GHCR images
docker images ghcr.io/username/*

# Logout
docker logout ghcr.io
```

## Update Workflow

Sau khi setup lần đầu:

```bash
# 1. Local: Build & push
./build-and-push-ghcr.sh your-username

# 2. Server: Pull & restart
ssh user@server "cd /path/to/project && docker compose pull && docker compose up -d"
```

## Lưu Token an toàn

```bash
# Save to file (local only, don't commit)
echo "YOUR_TOKEN" > ~/.ghcr-token
chmod 600 ~/.ghcr-token

# Use in script
cat ~/.ghcr-token | docker login ghcr.io -u username --password-stdin
```

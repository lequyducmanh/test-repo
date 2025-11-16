#!/bin/bash

# Build and Push to GitHub Container Registry (GHCR)
# Usage: ./build-and-push-ghcr.sh [github-username]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub username is provided
GITHUB_USERNAME=${1:-""}

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}Error: GitHub username not provided${NC}"
    echo "Usage: ./build-and-push-ghcr.sh your-github-username"
    exit 1
fi

echo -e "${GREEN}=== Building and Pushing to GitHub Container Registry ===${NC}"
echo -e "GitHub username: ${YELLOW}$GITHUB_USERNAME${NC}"
echo ""

# Login to GitHub Container Registry
echo -e "${YELLOW}Step 1: Login to GitHub Container Registry${NC}"
echo -e "${BLUE}You need a Personal Access Token (PAT) with 'write:packages' permission${NC}"
echo -e "${BLUE}Create one at: https://github.com/settings/tokens/new${NC}"
echo -e "${BLUE}Select scopes: write:packages, read:packages, delete:packages${NC}"
echo ""
echo "Enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
echo -e "${GREEN}✓ Logged in to GHCR${NC}"

# Registry URL
REGISTRY="ghcr.io/${GITHUB_USERNAME}"

# Update docker-compose.ghcr.yml with actual username
echo -e "\n${YELLOW}Step 2: Updating docker-compose.ghcr.yml${NC}"
if [ ! -f "docker-compose.ghcr.yml" ]; then
    cp docker-compose.prod.yml docker-compose.ghcr.yml
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|YOUR_DOCKERHUB_USERNAME/pg-server:latest|${REGISTRY}/pg-server:latest|g" docker-compose.ghcr.yml
    sed -i '' "s|YOUR_DOCKERHUB_USERNAME/pg-client:latest|${REGISTRY}/pg-client:latest|g" docker-compose.ghcr.yml
else
    # Linux
    sed -i "s|YOUR_DOCKERHUB_USERNAME/pg-server:latest|${REGISTRY}/pg-server:latest|g" docker-compose.ghcr.yml
    sed -i "s|YOUR_DOCKERHUB_USERNAME/pg-client:latest|${REGISTRY}/pg-client:latest|g" docker-compose.ghcr.yml
fi
echo -e "${GREEN}✓ docker-compose.ghcr.yml updated${NC}"

# Build Client
echo -e "\n${YELLOW}Step 3: Building Client...${NC}"
cd client
echo "Running npm install..."
npm install
echo "Building React app..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist folder not found. Build failed.${NC}"
    exit 1
fi

echo "Building Docker image..."
docker build -f Dockerfile.prod -t ${REGISTRY}/pg-client:latest .
echo -e "${GREEN}✓ Client image built${NC}"

# Build Server
echo -e "\n${YELLOW}Step 4: Building Server...${NC}"
cd ../server
docker build -t ${REGISTRY}/pg-server:latest .
echo -e "${GREEN}✓ Server image built${NC}"

cd ..

# Push images
echo -e "\n${YELLOW}Step 5: Pushing images to GHCR...${NC}"
echo "Pushing client..."
docker push ${REGISTRY}/pg-client:latest
echo -e "${GREEN}✓ Client pushed${NC}"

echo "Pushing server..."
docker push ${REGISTRY}/pg-server:latest
echo -e "${GREEN}✓ Server pushed${NC}"

echo -e "\n${GREEN}=== All Done! ===${NC}"
echo ""
echo "Images pushed to GitHub Container Registry:"
echo "  - ${REGISTRY}/pg-client:latest"
echo "  - ${REGISTRY}/pg-server:latest"
echo ""
echo "View your packages at: https://github.com/${GITHUB_USERNAME}?tab=packages"
echo ""
echo "To deploy on your server:"
echo "  1. Copy docker-compose.ghcr.yml to server:"
echo "     scp docker-compose.ghcr.yml user@server:/path/to/project/docker-compose.yml"
echo ""
echo "  2. On server, login to GHCR:"
echo "     echo \$GITHUB_TOKEN | docker login ghcr.io -u ${GITHUB_USERNAME} --password-stdin"
echo ""
echo "  3. Pull and run:"
echo "     docker compose pull"
echo "     docker compose up -d"
echo ""
echo -e "${BLUE}Note: Images are private by default. To make them public:${NC}"
echo "  Go to: https://github.com/${GITHUB_USERNAME}?tab=packages"
echo "  Click on package → Package settings → Change visibility"

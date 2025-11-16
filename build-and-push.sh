#!/bin/bash

# Build and Push Script for Docker Hub
# Usage: ./build-and-push.sh [docker-username]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker username is provided
DOCKER_USERNAME=${1:-""}

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: Docker username not provided${NC}"
    echo "Usage: ./build-and-push.sh your-dockerhub-username"
    exit 1
fi

echo -e "${GREEN}=== Building and Pushing Docker Images ===${NC}"
echo -e "Docker Hub username: ${YELLOW}$DOCKER_USERNAME${NC}"
echo ""

# Update docker-compose.prod.yml with actual username
echo -e "${YELLOW}Step 0: Updating docker-compose.prod.yml${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_DOCKERHUB_USERNAME/${DOCKER_USERNAME}/g" docker-compose.prod.yml
else
    # Linux
    sed -i "s/YOUR_DOCKERHUB_USERNAME/${DOCKER_USERNAME}/g" docker-compose.prod.yml
fi
echo -e "${GREEN}✓ docker-compose.prod.yml updated${NC}"

# Login to Docker Hub
echo -e "${YELLOW}Step 1: Login to Docker Hub${NC}"
docker login

# Build Client
echo -e "\n${YELLOW}Step 2: Building Client...${NC}"
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
docker build -f Dockerfile.prod -t ${DOCKER_USERNAME}/pg-client:latest .
echo -e "${GREEN}✓ Client image built successfully${NC}"

# Build Server
echo -e "\n${YELLOW}Step 3: Building Server...${NC}"
cd ../server
docker build -t ${DOCKER_USERNAME}/pg-server:latest .
echo -e "${GREEN}✓ Server image built successfully${NC}"

# Build Postgres (optional - usually use official image)
cd ..

# Push images
echo -e "\n${YELLOW}Step 4: Pushing images to Docker Hub...${NC}"
echo "Pushing client..."
docker push ${DOCKER_USERNAME}/pg-client:latest
echo -e "${GREEN}✓ Client pushed${NC}"

echo "Pushing server..."
docker push ${DOCKER_USERNAME}/pg-server:latest
echo -e "${GREEN}✓ Server pushed${NC}"

echo -e "\n${GREEN}=== All Done! ===${NC}"
echo ""
echo "Images pushed:"
echo "  - ${DOCKER_USERNAME}/pg-client:latest"
echo "  - ${DOCKER_USERNAME}/pg-server:latest"
echo ""
echo "docker-compose.prod.yml has been updated with your username."
echo ""
echo "To deploy on your server:"
echo "  1. Copy docker-compose.prod.yml to server:"
echo "     scp docker-compose.prod.yml user@server:/path/to/project/docker-compose.yml"
echo ""
echo "  2. Or commit and push to Git:"
echo "     git add docker-compose.prod.yml"
echo "     git commit -m 'Update Docker Hub username'"
echo "     git push"
echo ""
echo "  3. On server run:"
echo "     docker compose pull"
echo "     docker compose up -d"

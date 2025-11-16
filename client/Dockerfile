# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with aggressive memory optimizations
# Remove cache immediately after install to save memory
RUN npm ci --prefer-offline --no-audit --progress=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build with extreme memory constraints for 1GB RAM server
# Skip TypeScript checking, use minimal memory
ENV NODE_OPTIONS="--max-old-space-size=400 --no-warnings" \
    VITE_BUILD_TARGET="production" \
    NODE_ENV="production"

# Use fast build (skip tsc check) to reduce memory usage
RUN npm run build:fast

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

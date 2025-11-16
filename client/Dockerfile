# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations for low CPU
# Install all deps (including devDependencies for build tools)
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Build the application with optimized settings for 1 core
# Reduce memory, limit workers, disable parallel processing
ENV NODE_OPTIONS="--max-old-space-size=768" \
    VITE_BUILD_TARGET="production" \
    NODE_ENV="production"

# Build with limited resources
RUN npm run build

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

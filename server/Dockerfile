# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations for low CPU
# --prefer-offline: use cache when possible
# --no-audit: skip audit to save time
# --progress=false: reduce output overhead
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Build TypeScript with limited resources
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only with optimizations
RUN npm ci --only=production --prefer-offline --no-audit --progress=false

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]

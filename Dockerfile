# Dockerfile para InfoPanama Crawler
# Optimizado para Digital Ocean App Platform

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/crawler/package*.json ./packages/crawler/
COPY packages/convex/package*.json ./packages/convex/

# Install dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Build the crawler
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/crawler/node_modules ./packages/crawler/node_modules
COPY --from=deps /app/packages/convex/node_modules ./packages/convex/node_modules

# Copy source code
COPY . .

# Build convex first (dependency)
WORKDIR /app/packages/convex
RUN npm run build || true

# Build crawler
WORKDIR /app/packages/crawler
RUN npm run build || true

# Production image
FROM base AS runner
WORKDIR /app

# Install Playwright browsers and system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Playwright to use system chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package*.json ./

# Set to production
ENV NODE_ENV=production

# Run as non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 crawler
USER crawler

# Default command (can be overridden in Digital Ocean)
CMD ["npm", "run", "crawl:all"]

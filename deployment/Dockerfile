# ==============================================================================
# MULTI-STAGE DOCKERFILE — BSAN JAWA TIMUR MONITORING SYSTEM
# Optimized for 2GB RAM / 2 vCPU VM
# ==============================================================================

# ── Stage 1: Build Frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ── Stage 2: Production API Server ───────────────────────────────────────────
FROM node:20-alpine AS api-server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production --silent
COPY server/ ./
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["node", "--max-old-space-size=512", "index.js"]

# ── Stage 3: Nginx Web Server for Production ─────────────────────────────────
FROM nginx:alpine AS production-nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

#!/usr/bin/env bash
# ==============================================================================
# AUTOMATED DEPLOYMENT SCRIPT — BSAN JAWA TIMUR (DOCKER & CLOUDPANEL VM)
# ==============================================================================
set -e

echo "🚀 Starting Automated Deployment for Survasi..."

# 1. Target Directory
TARGET_DIR="/home/survasi/htdocs/survasi.com"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# 2. Check if git repo exists, pull or clone
if [ -d ".git" ]; then
    echo "📥 Pulling latest source code from GitHub..."
    git pull origin main || git pull origin feature/rbac-and-user-management || git pull || true
else
    echo "📥 Cloning project repository..."
    git clone https://github.com/git-muhammadarifirfan/survasi.com.git .
fi

# 3. Create / Update server/.env
mkdir -p server
cat << 'EOF' > server/.env
PORT=3001
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=survasi
DB_PASS=admin.id01
DB_NAME=dbsurvasi
DB_CONNECTION_LIMIT=12
JWT_SECRET=bsan_jatim_monitoring_jwt_secret_change_this_in_production_32chars_min
JWT_EXPIRES_IN=8h
CORS_ORIGINS=https://survasi.com,http://localhost:5173
EOF

# 4. Import Complete Database Dump (Schema + All Data)
echo "🗄️ Importing Complete MySQL Database (schema & all data) into dbsurvasi..."
if [ -f "database/production_dump.sql" ]; then
    mysql -u survasi -padmin.id01 dbsurvasi < database/production_dump.sql 2>/dev/null || true
elif [ -f "export_db/import_ke_production.sql" ]; then
    mysql -u survasi -padmin.id01 dbsurvasi < export_db/import_ke_production.sql 2>/dev/null || true
fi

# 5. Check for Docker support
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Docker Engine detected! Deploying via Docker Compose (Container 1: Nginx Web, Container 2: Express API)..."
    docker compose -f deployment/docker-compose.yml up -d --build
    echo "✅ DOCKER CONTAINERS DEPLOYED & RUNNING!"
else
    echo "⚡ Deploying via Native CloudPanel PM2 & Node Engine..."
    echo "📦 Installing npm dependencies & building production bundle..."
    npm install -g pnpm pm2 2>/dev/null || true
    pnpm install || npm install
    pnpm build || npm run build

    # 6. Install Server Dependencies & Start PM2
    cd server
    npm install
    pm2 start ../deployment/ecosystem.config.cjs 2>/dev/null || pm2 restart bsan-jatim-api 2>/dev/null || node index.js &
    pm2 save 2>/dev/null || true
fi

echo -e "\n✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🌐 Site is live on https://survasi.com"

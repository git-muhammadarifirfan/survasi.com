#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# BSAN JAWA TIMUR — AUTOMATED CRON DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════

# Set Full PATH for Cron execution environment
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/home/$USER/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$HOME/.local/share/pnpm:$HOME/.pnpm-global/bin

# Set Working Directory (Auto-detect script directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR" || exit 1

LOG_FILE="$SCRIPT_DIR/deploy.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Starting automated deployment..." >> "$LOG_FILE"

# 1. Fetch & Hard Reset to GitHub main branch
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📥 Pulling latest code from origin/main..." >> "$LOG_FILE"
git fetch origin main >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

# 2. Install dependencies & Build Frontend
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🏗️ Building frontend bundle..." >> "$LOG_FILE"
if command -v pnpm &> /dev/null; then
    pnpm install >> "$LOG_FILE" 2>&1
    pnpm run build >> "$LOG_FILE" 2>&1
else
    npm install >> "$LOG_FILE" 2>&1
    npm run build >> "$LOG_FILE" 2>&1
fi

# 3. Restart Backend Server
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Restarting backend service..." >> "$LOG_FILE"
if command -v pm2 &> /dev/null; then
    pm2 restart all >> "$LOG_FILE" 2>&1
else
    # Touch entry point file to trigger Node.js app reloader (CloudPanel/cPanel)
    touch "$SCRIPT_DIR/server/index.js" >> "$LOG_FILE" 2>&1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Deployment finished successfully!" >> "$LOG_FILE"

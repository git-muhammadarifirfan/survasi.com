#!/bin/bash
# ============================================
# START BACKEND — SURVASI.COM (PRODUCTION)
# ============================================
# Cron Job: */5 * * * * /home/survasi/htdocs/survasi.com/server/start_backend.sh
# Artinya: setiap 5 menit cek, kalau mati otomatis restart

LOG="/home/survasi/htdocs/survasi.com/server/debug.log"
DIR="/home/survasi/htdocs/survasi.com/server"
PIDFILE="/home/survasi/htdocs/survasi.com/server/.node.pid"

# 2. Masuk ke folder server
cd "$DIR" || exit 1

# Extract PORT from .env if present (default 3001)
PORT=$(grep -E '^PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d '\r"' "'")
PORT=${PORT:-3001}

# Cek apakah server sudah jalan via PID atau PORT
if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
        exit 0
    fi
fi

if netstat -tuln 2>/dev/null | grep -q ":$PORT " || ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "=== $(date) — Server already running on port $PORT ===" >> "$LOG"
    exit 0
fi

echo "=== $(date) — Starting Production Server ===" >> "$LOG"

# 1. Cari Node.js dari NVM
NODE_BIN=$(find /home/survasi/.nvm -name 'node' -type f 2>/dev/null | head -1)
NPM_BIN="$(dirname "$NODE_BIN")/npm"
export PATH="$(dirname "$NODE_BIN"):$PATH"

echo "Node: $NODE_BIN" >> "$LOG"

if [ -z "$NODE_BIN" ]; then
    echo "GAGAL: Node.js tidak ditemukan!" >> "$LOG"
    exit 1
fi

# 2. Masuk ke folder server
cd "$DIR" || exit 1

# 3. Install dependencies (hanya kalau node_modules belum ada)
if [ ! -d "node_modules" ]; then
    echo "--- npm install ---" >> "$LOG"
    "$NPM_BIN" install --production >> "$LOG" 2>&1
fi

# 4. Kill proses lama jika ada
pkill -f "node index.js" 2>/dev/null
sleep 1

# 5. Start server dengan production env
echo "--- Starting server (PRODUCTION) ---" >> "$LOG"
NODE_ENV=production nohup "$NODE_BIN" index.js >> "$LOG" 2>&1 &
echo $! > "$PIDFILE"
echo "PID: $!" >> "$LOG"
echo "DB: dbsurvasi (PRODUCTION)" >> "$LOG"

#!/bin/bash
# ============================================
# START BACKEND — NOC.SURVASI.COM (DEVELOPMENT)
# ============================================
# Cron Job: */5 * * * * /home/devsurvasi/htdocs/noc.survasi.com/server/start_backend.sh
# Artinya: setiap 5 menit cek, kalau mati otomatis restart

LOG="/home/devsurvasi/htdocs/noc.survasi.com/server/debug.log"
DIR="/home/devsurvasi/htdocs/noc.survasi.com/server"
PIDFILE="/home/devsurvasi/htdocs/noc.survasi.com/server/.node.pid"

# Cek apakah server sudah jalan
if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
        # Server masih jalan, skip
        exit 0
    fi
fi

echo "=== $(date) — Starting Dev Server ===" >> "$LOG"

# 1. Cari Node.js dari NVM
NODE_BIN=$(find /home/devsurvasi/.nvm -name 'node' -type f 2>/dev/null | head -1)
NPM_BIN="$(dirname "$NODE_BIN")/npm"
export PATH="$(dirname "$NODE_BIN"):$PATH"

echo "Node: $NODE_BIN" >> "$LOG"

if [ -z "$NODE_BIN" ]; then
    echo "GAGAL: Node.js tidak ditemukan!" >> "$LOG"
    exit 1
fi

# 2. Masuk ke folder server
cd "$DIR" || exit 1

# 3. Gunakan .env.development (copy ke .env)
if [ -f ".env.development" ]; then
    cp .env.development .env
    echo "Using .env.development (dbnocsurvasi)" >> "$LOG"
fi

# 4. Install dependencies (hanya kalau node_modules belum ada)
if [ ! -d "node_modules" ]; then
    echo "--- npm install ---" >> "$LOG"
    "$NPM_BIN" install --production >> "$LOG" 2>&1
fi

# 5. Kill proses lama jika ada
pkill -f "node index.js" 2>/dev/null
sleep 1

# 6. Start server dengan development env
echo "--- Starting server (DEVELOPMENT) ---" >> "$LOG"
NODE_ENV=development nohup "$NODE_BIN" index.js >> "$LOG" 2>&1 &
echo $! > "$PIDFILE"
echo "PID: $!" >> "$LOG"
echo "DB: dbnocsurvasi (DEVELOPMENT)" >> "$LOG"

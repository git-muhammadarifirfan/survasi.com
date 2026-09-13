#!/bin/bash
# ============================================
# START BACKEND — SURVASI.COM
# ============================================

LOG="/home/survasi/htdocs/survasi.com/server/debug.log"
DIR="/home/survasi/htdocs/survasi.com/server"

echo "=== $(date) ===" > "$LOG"

# 1. Cari Node.js dari NVM
NODE_BIN=$(find /home/survasi/.nvm -name 'node' -type f 2>/dev/null | head -1)
# NPM ada di folder yang SAMA dengan Node
NPM_BIN="$(dirname "$NODE_BIN")/npm"
# Tambahkan ke PATH agar npm bisa menemukan node
export PATH="$(dirname "$NODE_BIN"):$PATH"

echo "Node: $NODE_BIN" >> "$LOG"
echo "NPM: $NPM_BIN" >> "$LOG"
echo "PATH: $PATH" >> "$LOG"

if [ -z "$NODE_BIN" ]; then
    echo "GAGAL: Node.js tidak ditemukan!" >> "$LOG"
    exit 1
fi

# 2. Masuk ke folder server
cd "$DIR" || exit 1
echo "PWD: $(pwd)" >> "$LOG"

# 3. Install dependencies
echo "--- npm install ---" >> "$LOG"
rm -rf node_modules package-lock.json
"$NPM_BIN" install >> "$LOG" 2>&1

# 4. Cek compression
if [ -d "node_modules/compression" ]; then
    echo "compression: OK" >> "$LOG"
else
    echo "compression: GAGAL! node_modules:" >> "$LOG"
    ls node_modules/ >> "$LOG" 2>&1
    exit 1
fi

# 5. Kill proses lama & start backend
pkill -f "node index.js" 2>/dev/null
sleep 1
echo "--- Starting server ---" >> "$LOG"
nohup "$NODE_BIN" index.js >> "$LOG" 2>&1 &
echo "PID: $!" >> "$LOG"

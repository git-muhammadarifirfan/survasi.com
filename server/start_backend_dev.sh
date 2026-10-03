#!/bin/bash
# ============================================
# START / RESTART BACKEND — NOC.SURVASI.COM (DEVELOPMENT / STAGING)
# ============================================

# Automatically detect script directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

LOG="$DIR/debug.log"
PIDFILE="$DIR/.node.pid"

echo "=== $(date) — Restarting Staging Backend Server ===" >> "$LOG"

# 1. Use .env.development if present
if [ -f ".env.development" ]; then
    cp .env.development .env
    echo "Using .env.development" >> "$LOG"
fi

# 2. Detect Node.js binary (NVM or System Node)
NODE_BIN=$(which node 2>/dev/null)
if [ -z "$NODE_BIN" ]; then
    NODE_BIN=$(find "$HOME/.nvm" -name 'node' -type f 2>/dev/null | head -1)
fi
if [ -z "$NODE_BIN" ]; then
    NODE_BIN=$(find /home/*/.nvm -name 'node' -type f 2>/dev/null | head -1)
fi

echo "Node Binary: $NODE_BIN" >> "$LOG"

if [ -z "$NODE_BIN" ]; then
    echo "ERROR: Node.js binary not found!" >> "$LOG"
    exit 1
fi

export PATH="$(dirname "$NODE_BIN"):$PATH"

# 3. Force kill existing Node process running index.js to reload new code
echo "Killing old Node processes..." >> "$LOG"
pkill -9 -f "node.*index.js" 2>/dev/null
pkill -9 -f "index.js" 2>/dev/null
sleep 1

# 4. Start server with development environment
echo "Starting Node server (DEVELOPMENT)..." >> "$LOG"
NODE_ENV=development nohup "$NODE_BIN" index.js >> "$LOG" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PIDFILE"

echo "Success: Staging server started with PID $NEW_PID" >> "$LOG"

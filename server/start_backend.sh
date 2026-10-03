#!/bin/bash
# ============================================
# START / RESTART BACKEND — NOC.SURVASI.COM
# ============================================

# Automatically detect script directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

LOG="$DIR/debug.log"
PIDFILE="$DIR/.node.pid"

echo "=== $(date) — Restarting Backend Server ===" >> "$LOG"

# 1. Detect Node.js binary (NVM or System Node)
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

# 2. Kill existing node processes running index.js to force load new code
echo "Killing old Node processes..." >> "$LOG"
pkill -9 -f "node.*index.js" 2>/dev/null
pkill -9 -f "index.js" 2>/dev/null
sleep 1

# 3. Start server with production environment
echo "Starting Node server in background..." >> "$LOG"
NODE_ENV=production nohup "$NODE_BIN" index.js >> "$LOG" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PIDFILE"

echo "Success: Server started with PID $NEW_PID" >> "$LOG"

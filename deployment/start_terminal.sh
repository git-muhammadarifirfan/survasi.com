#!/usr/bin/env bash
# ==============================================================================
# WEB TERMINAL LAUNCHER VIA CLOUDFLARE TUNNEL (DETACHED PROCESS)
# ==============================================================================
TARGET_DIR="/home/survasi/htdocs/survasi.com"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

if [ ! -f /tmp/ttyd ]; then
    curl -sLk https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.x86_64 -o /tmp/ttyd
    chmod +x /tmp/ttyd
fi

if [ ! -f /tmp/cloudflared ]; then
    curl -sLk https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
fi

pkill -9 -f ttyd 2>/dev/null || true
pkill -9 -f cloudflared 2>/dev/null || true
sleep 1

nohup /tmp/ttyd -p 7681 bash > /tmp/ttyd.log 2>&1 &
disown %1 2>/dev/null || true
sleep 2

nohup /tmp/cloudflared tunnel --url http://localhost:7681 > "$TARGET_DIR/terminal_url.txt" 2>&1 &
disown %2 2>/dev/null || true
sleep 6

echo "Terminal URL process detached successfully."

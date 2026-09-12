#!/usr/bin/env bash
# ==============================================================================
# WEB TERMINAL LAUNCHER VIA CLOUDFLARE TUNNEL
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

pkill -f ttyd || true
pkill -f cloudflared || true
sleep 1

/tmp/ttyd -p 7681 bash > /tmp/ttyd.log 2>&1 &
sleep 2

/tmp/cloudflared tunnel --url http://localhost:7681 > "$TARGET_DIR/terminal_url.txt" 2>&1 &
sleep 5

echo "Terminal URL process started."

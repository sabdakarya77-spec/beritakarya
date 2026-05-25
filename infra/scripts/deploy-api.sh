#!/bin/bash
# ─────────────────────────────────────────────────────────────
# deploy-api.sh — Script deploy ulang API container di VPS
# Jalankan dari: /opt/beritakarya
# Usage: bash infra/scripts/deploy-api.sh
# ─────────────────────────────────────────────────────────────
set -e

COMPOSE_FILE="infra/docker/docker-compose.backend.yml"
PROJECT_DIR="/opt/beritakarya"

echo "🚀 [1/6] Masuk ke direktori project..."
cd "$PROJECT_DIR"

echo "📥 [2/6] Pull perubahan terbaru dari Git..."
git pull origin main

echo "🛑 [3/6] Stop container API yang berjalan..."
docker compose -f "$COMPOSE_FILE" stop api || true

echo "🗑  [4/6] Hapus image API lama agar build dari awal..."
docker compose -f "$COMPOSE_FILE" rm -f api || true
docker image rm beritakarya-api 2>/dev/null || true
# Hapus semua dangling images untuk hemat disk
docker image prune -f

echo "🔨 [5/6] Build image API baru (dengan --no-cache)..."
docker compose -f "$COMPOSE_FILE" build --no-cache api

echo "▶️  [6/6] Jalankan semua services..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "⏳ Menunggu API selesai startup (60 detik)..."
sleep 20

echo ""
echo "📋 Status container:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "📜 Log API (30 baris terakhir):"
docker compose -f "$COMPOSE_FILE" logs --tail=30 api

echo ""
echo "✅ Deploy selesai! Periksa log di atas untuk memastikan API berjalan normal."

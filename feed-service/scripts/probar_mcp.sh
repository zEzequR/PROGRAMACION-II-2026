#!/bin/bash
# Prueba manual del servidor MCP de feed-service.
# Uso: ./scripts/probar_mcp.sh [id_persona]
# Correr con el servicio ya levantado (cargo run) en otra terminal.

URL="http://127.0.0.1:3002/mcp"
ID_PERSONA="${1:-}"

echo "== 1) initialize =="
INIT_HEADERS=$(mktemp)
curl -s -D "$INIT_HEADERS" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": { "name": "probar_mcp", "version": "0.1.0" }
    }
  }' | jq

SESSION_ID=$(grep -i "^mcp-session-id:" "$INIT_HEADERS" | awk '{print $2}' | tr -d '\r')
rm -f "$INIT_HEADERS"
echo "Session ID: $SESSION_ID"

echo ""
echo "== 2) notifications/initialized =="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc": "2.0", "method": "notifications/initialized"}'
echo ""

echo ""
echo "== 3) tools/list =="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}' | jq

echo ""
if [ -z "$ID_PERSONA" ]; then
  echo "== 4) tools/call get_user_feed (sin id_persona -> nivel 1, trending global) =="
  ARGS='{}'
else
  echo "== 4) tools/call get_user_feed (id_persona=$ID_PERSONA) =="
  ARGS="{\"id_persona\": $ID_PERSONA}"
fi

curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d "{\"jsonrpc\": \"2.0\", \"id\": 3, \"method\": \"tools/call\", \"params\": {\"name\": \"get_user_feed\", \"arguments\": $ARGS}}" | jq
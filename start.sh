#!/bin/bash
# WAECPrep — Start everything

echo "Starting WAECPrep API..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!
echo "API running (PID $API_PID) at http://localhost:8000"

echo ""
echo "Starting mobile app..."
cd "$(dirname "$0")/mobile"
ulimit -n 65536
npx expo start --lan

# Cleanup on exit
trap "kill $API_PID 2>/dev/null" EXIT

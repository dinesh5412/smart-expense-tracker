#!/usr/bin/env bash
DIR="$(dirname "$0")"

echo "==================================================="
echo "  Smart Expense & Budget Tracker - Full Stack Start"
echo "==================================================="
echo "[1/2] Launching Spring Boot Backend..."
bash "$DIR/run-backend.sh" &
BACKEND_PID=$!

sleep 4

echo "[2/2] Launching React Frontend..."
bash "$DIR/run-frontend.sh" &
FRONTEND_PID=$!

echo ""
echo "==================================================="
echo "Both services launched!"
echo "- Frontend:  http://localhost:5173"
echo "- Backend:   http://localhost:8080/api"
echo "- H2 DB:     http://localhost:8080/h2-console"
echo "Press Ctrl+C to terminate both servers."
echo "==================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" SIGINT SIGTERM EXIT
wait

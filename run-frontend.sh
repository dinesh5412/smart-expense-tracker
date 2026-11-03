#!/usr/bin/env bash
cd "$(dirname "$0")/frontend"

echo "==================================================="
echo "  Smart Expense & Budget Tracker - React Frontend"
echo "==================================================="
echo "Starting Vite React development server on http://localhost:5173..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev

#!/bin/bash
echo "🚀 Starting Tuition Classes App..."
echo ""

# Start backend in background
cd backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) → http://localhost:5000"

# Start frontend
cd ../frontend
echo "✅ Frontend starting → http://localhost:3000"
npm run dev

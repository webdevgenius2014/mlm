#!/bin/bash

# Start script for local development (without Docker)
# This script starts both backend and frontend in parallel

echo "Starting MLM Platform (Local Development)..."
echo ""

# Function to kill background processes on script exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend on http://localhost:5000..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================="
echo "Services Started!"
echo "=================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================="
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

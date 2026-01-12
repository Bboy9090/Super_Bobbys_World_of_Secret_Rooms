#!/bin/bash
# Start All Backends
# Starts both Python (port 8000) and Node.js (port 3001) backends

echo "🔥 Super Bobby's World - Starting All Backends"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "⚠️  Warning: Python not found. Python backend will not start."
    echo "   Install Python 3.11+ to use Secret Rooms (Sonic, Ghost, Pandora)"
    PYTHON_CMD=""
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Start Python backend (port 8000)
if [ -n "$PYTHON_CMD" ]; then
    echo "🐍 Starting Python backend (port 8000)..."
    cd backend || exit 1
    $PYTHON_CMD -m uvicorn main:app --reload --port 8000 &
    PYTHON_PID=$!
    cd "$PROJECT_ROOT" || exit 1
    echo "   Python backend PID: $PYTHON_PID"
    sleep 2
fi

# Start Node.js backend (port 3001)
echo "📦 Starting Node.js backend (port 3001)..."
npm run server:dev &
NODE_PID=$!
echo "   Node.js backend PID: $NODE_PID"
sleep 2

echo ""
echo "✅ Backends starting..."
echo ""
echo "Backend URLs:"
echo "  Python (Secret Rooms): http://localhost:8000"
echo "  Node.js (Device Management): http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all backends"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping backends...'; kill $PYTHON_PID $NODE_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait

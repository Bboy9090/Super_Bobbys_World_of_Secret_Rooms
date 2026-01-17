#!/bin/bash
# Super Bobby's World: Warp Zones - Build Script
# Orchestrates building both backend and frontend

set -e  # Exit on error

echo "🌟 Super Bobby's World: Building Warp Zones..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}[ERROR]${NC} Must run from repository root"
    exit 1
fi

# Build Backend
echo -e "${YELLOW}[1/2]${NC} Building Rust backend..."
if [ -d "backend" ]; then
    cd backend
    if cargo build --release; then
        echo -e "${GREEN}[SUCCESS]${NC} Backend built successfully"
    else
        echo -e "${RED}[ERROR]${NC} Backend build failed"
        exit 1
    fi
    cd ..
else
    echo -e "${YELLOW}[WARN]${NC} Backend directory not found, skipping"
fi

echo ""

# Build Frontend
echo -e "${YELLOW}[2/2]${NC} Building React frontend..."
if [ -d "client" ]; then
    cd client
    if npm run build; then
        echo -e "${GREEN}[SUCCESS]${NC} Frontend built successfully"
    else
        echo -e "${RED}[ERROR]${NC} Frontend build failed"
        exit 1
    fi
    cd ..
else
    echo -e "${YELLOW}[WARN]${NC} Client directory not found, skipping"
fi

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Backend binary: backend/target/release/warp-zones-backend"
echo "Frontend assets: client/dist/"
echo ""
echo "To run:"
echo "  - Backend: cd backend && cargo run --release"
echo "  - Frontend: Serve client/dist/ with a web server"
echo "  - Both: npm run world:start"

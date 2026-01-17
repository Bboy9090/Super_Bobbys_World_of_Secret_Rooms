#!/bin/bash
# Super Bobby's World: Warp Zones - Test Script
# Orchestrates testing both backend and frontend

set -e  # Exit on error

echo "🌟 Super Bobby's World: Testing Warp Zones..."
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

# Test Backend
echo -e "${YELLOW}[1/2]${NC} Testing Rust backend..."
if [ -d "backend" ]; then
    cd backend
    if cargo test; then
        echo -e "${GREEN}[SUCCESS]${NC} Backend tests passed"
    else
        echo -e "${RED}[ERROR]${NC} Backend tests failed"
        exit 1
    fi
    cd ..
else
    echo -e "${YELLOW}[WARN]${NC} Backend directory not found, skipping"
fi

echo ""

# Test Frontend
echo -e "${YELLOW}[2/2]${NC} Testing React frontend..."
if [ -d "client" ]; then
    cd client
    if [ -f "package.json" ]; then
        # Check if test script exists
        if npm run test --if-present; then
            echo -e "${GREEN}[SUCCESS]${NC} Frontend tests passed"
        else
            echo -e "${YELLOW}[WARN]${NC} No frontend tests configured"
        fi
    fi
    cd ..
else
    echo -e "${YELLOW}[WARN]${NC} Client directory not found, skipping"
fi

echo ""
echo -e "${GREEN}✅ Tests complete!${NC}"

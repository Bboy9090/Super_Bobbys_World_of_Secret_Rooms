@echo off
cls
echo Bobby's Workshop - Portable Mode

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js required
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --production
    cd server
    call npm install --production
    cd ..
)

echo Starting server...
start "" http://localhost:3001
cd server
node index.js
pause

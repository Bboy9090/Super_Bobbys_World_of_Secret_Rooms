@echo off
cls
echo Starting Bobby's Workshop...

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

echo Server starting at: http://localhost:3001
start "" http://localhost:3001
cd /d "%~dp0server"
node index.js
pause

# Start All Backends
# Starts both Python (port 8000) and Node.js (port 3001) backends

Write-Host "🔥 Super Bobby's World - Starting All Backends" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "⚠️  Warning: Python not found. Python backend will not start." -ForegroundColor Yellow
    Write-Host "   Install Python 3.11+ to use Secret Rooms (Sonic, Ghost, Pandora)" -ForegroundColor Yellow
}

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Start Python backend (port 8000)
if ($pythonCmd) {
    Write-Host "🐍 Starting Python backend (port 8000)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; cd backend; $pythonCmd -m uvicorn main:app --reload --port 8000" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start Node.js backend (port 3001)
Write-Host "📦 Starting Node.js backend (port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run server:dev" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Backends starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend URLs:" -ForegroundColor Cyan
Write-Host "  Python (Secret Rooms): http://localhost:8000" -ForegroundColor White
Write-Host "  Node.js (Device Management): http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (backends will continue running in separate windows)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop backends, close the PowerShell windows or run:" -ForegroundColor Yellow
Write-Host "  Get-Process | Where-Object {`$_.ProcessName -eq 'python' -or `$_.ProcessName -eq 'node'} | Stop-Process" -ForegroundColor Gray
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "Script stopped." -ForegroundColor Yellow
}

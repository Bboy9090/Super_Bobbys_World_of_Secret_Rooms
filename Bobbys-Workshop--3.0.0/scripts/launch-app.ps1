# Launch Script for Super Bobby's World
# Starts the development server and opens the app in browser

$ErrorActionPreference = "Continue"

Write-Host "🔥 Super Bobby's World - Launching Application" -ForegroundColor Cyan
Write-Host ""

# Get project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Check if backends are running
Write-Host "📡 Checking backend status..." -ForegroundColor Yellow

$nodeRunning = $false
$pythonRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $nodeRunning = $true
        Write-Host "   ✅ Node.js backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Node.js backend not running" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $pythonRunning = $true
        Write-Host "   ✅ Python backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Python backend not running" -ForegroundColor Yellow
}

# Start backends if not running
if (-not $nodeRunning -or -not $pythonRunning) {
    Write-Host ""
    Write-Host "🚀 Starting backends..." -ForegroundColor Cyan
    $startBackendsScript = Join-Path $ProjectRoot "start-all-backends.ps1"
    if (Test-Path $startBackendsScript) {
        Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$startBackendsScript`"" -WindowStyle Minimized
        Write-Host "   ⏳ Waiting for backends to start (10 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "   ⚠️  start-all-backends.ps1 not found" -ForegroundColor Yellow
        Write-Host "   💡 Please start backends manually:" -ForegroundColor Yellow
        Write-Host "      .\start-all-backends.ps1" -ForegroundColor White
    }
}

# Start frontend dev server
Write-Host ""
Write-Host "🌐 Starting frontend development server..." -ForegroundColor Cyan

# Check if already running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend server already running" -ForegroundColor Green
        Start-Process "http://localhost:5173"
        Write-Host ""
        Write-Host "✅ Application opened in browser!" -ForegroundColor Green
        return
    }
} catch {
    # Not running, continue
}

# Start dev server
Write-Host "   ⏳ Starting Vite dev server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$ProjectRoot`"; npm run dev" -WindowStyle Minimized

# Wait for server to start
Write-Host "   ⏳ Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Write-Host ""
Write-Host "🌐 Opening application in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✅ Application launched!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Tips:" -ForegroundColor Yellow
Write-Host "   - Backends should start automatically" -ForegroundColor White
Write-Host "   - Check BackendStatusIndicator in the app header" -ForegroundColor White
Write-Host "   - Close this window when done (backends will continue running)" -ForegroundColor White
Write-Host ""

# Build Production Executable & Installer
# Creates a standalone .exe and installer you can double-click to run

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Super Bobbys World - Production Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Create output directory
$outputDir = Join-Path $ScriptDir "app\windows"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "Step 1: Preparing bundle resources..." -ForegroundColor Yellow
npm run prepare:bundle --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Bundle preparation had issues, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Building Tauri production executable..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes..." -ForegroundColor Gray
Write-Host ""

Push-Location "src-tauri"
try {
    # Build with MSI and NSIS installers
    cargo tauri build --bundles msi,nsis
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tauri build failed!" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Step 4: Copying files to app/windows/..." -ForegroundColor Yellow

# Find built files
$releaseDir = Join-Path $ScriptDir "src-tauri\target\release"
$bundleDir = Join-Path $releaseDir "bundle"

# Copy standalone executable
$exeFiles = Get-ChildItem -Path $releaseDir -Filter "*.exe" -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -like "*super-bobbys-world*" -or $_.Name -like "*Super Bobbys World*"
}
if ($exeFiles) {
    $exeFile = $exeFiles[0]
    $destExe = Join-Path $outputDir "Super Bobbys World.exe"
    Copy-Item $exeFile.FullName -Destination $destExe -Force
    Write-Host "Executable: Super Bobbys World.exe" -ForegroundColor Green
}

# Copy MSI installer
$msiFiles = Get-ChildItem -Path (Join-Path $bundleDir "msi") -Filter "*.msi" -ErrorAction SilentlyContinue
if ($msiFiles) {
    $msiFile = $msiFiles[0]
    $destMsi = Join-Path $outputDir $msiFile.Name
    Copy-Item $msiFile.FullName -Destination $destMsi -Force
    Write-Host "Installer (MSI): $($msiFile.Name)" -ForegroundColor Green
}

# Copy NSIS installer
$nsisFiles = Get-ChildItem -Path (Join-Path $bundleDir "nsis") -Filter "*.exe" -ErrorAction SilentlyContinue
if ($nsisFiles) {
    $nsisFile = $nsisFiles[0]
    $destNsis = Join-Path $outputDir $nsisFile.Name
    Copy-Item $nsisFile.FullName -Destination $destNsis -Force
    Write-Host "Installer (NSIS): $($nsisFile.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Production Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your files are in: app\windows\" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install:" -ForegroundColor Yellow
Write-Host "  1. Double-click the .msi or .exe installer" -ForegroundColor White
Write-Host "  2. Follow the installation wizard" -ForegroundColor White
Write-Host "  3. Launch from Start Menu or desktop shortcut" -ForegroundColor White
Write-Host ""
Write-Host "OR run directly:" -ForegroundColor Yellow
Write-Host "  Double-click: app\windows\Super Bobbys World.exe" -ForegroundColor White
Write-Host ""

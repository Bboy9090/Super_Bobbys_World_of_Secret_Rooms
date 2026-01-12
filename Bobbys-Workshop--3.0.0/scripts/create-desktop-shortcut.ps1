# Create Desktop Shortcut for Super Bobby's World
# Creates a desktop shortcut with custom icon that launches the application

param(
    [string]$ShortcutName = "Super Bobby's World",
    [string]$IconPath = "",
    [switch]$UseBrowser = $true
)

$ErrorActionPreference = "Stop"

Write-Host "🔥 Creating Desktop Shortcut for Super Bobby's World" -ForegroundColor Cyan
Write-Host ""

# Get paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "$ShortcutName.lnk"

# Find icon if not provided
if ([string]::IsNullOrWhiteSpace($IconPath)) {
    $iconOptions = @(
        Join-Path $ProjectRoot "src-tauri" "icons" "icon.ico",
        Join-Path $ProjectRoot "assets" "icons" "app-icon.ico",
        Join-Path $ProjectRoot "src-tauri" "icons" "icon.png"
    )
    
    foreach ($option in $iconOptions) {
        if (Test-Path $option) {
            $IconPath = $option
            break
        }
    }
}

# Check if icon exists
if ([string]::IsNullOrWhiteSpace($IconPath) -or -not (Test-Path $IconPath)) {
    Write-Host "⚠️  Warning: Icon not found" -ForegroundColor Yellow
    Write-Host "   Creating shortcut with default icon..." -ForegroundColor Yellow
    Write-Host "   To use your logo, save it as: src-tauri\icons\icon.ico" -ForegroundColor Yellow
    $IconPath = $null
}

# Determine launcher script
$LauncherScript = Join-Path $ProjectRoot "scripts\launch-app.ps1"

# Create WScript COM object for shortcut
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)

# Set shortcut properties
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$LauncherScript`""
$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.Description = "Super Bobby's World of Secret Rooms and Tech - Device Recovery & Repair Tool"
$Shortcut.WindowStyle = 1  # Normal window

# Set icon if provided
if ($IconPath -and (Test-Path $IconPath)) {
    $Shortcut.IconLocation = $IconPath
    Write-Host "✅ Using custom icon: $IconPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  Using default PowerShell icon" -ForegroundColor Yellow
}

# Save shortcut
$Shortcut.Save()

Write-Host ""
Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "   Location: $ShortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Add your logo image to: assets\icons\app-icon.ico (or .png)" -ForegroundColor White
Write-Host "   2. Run this script again to update the shortcut icon" -ForegroundColor White
Write-Host "   3. Double-click the shortcut to launch the app" -ForegroundColor White
Write-Host ""

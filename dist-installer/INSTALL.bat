@echo off
cls
echo Installing Bobby's Workshop...

set INSTALL_DIR=%LOCALAPPDATA%\BobbysWorkshop
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copying files...
xcopy /E /I /Y /Q "%~dp0dist" "%INSTALL_DIR%\dist"
xcopy /E /I /Y /Q "%~dp0server" "%INSTALL_DIR%\server"
copy /Y "%~dp0package.json" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0START.bat" "%INSTALL_DIR%\" >nul

echo Installing dependencies...
cd /d "%INSTALL_DIR%"
call npm install --production

cd /d "%INSTALL_DIR%\server"
call npm install --production

echo Installation complete!
echo Location: %INSTALL_DIR%
pause

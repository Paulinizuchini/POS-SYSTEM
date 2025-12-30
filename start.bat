@echo off
echo POS System 101.1 wird gestartet...
echo.

echo Backend wird installiert...
cd backend
call npm install
if errorlevel 1 (
    echo Fehler beim Installieren des Backends
    pause
    exit /b 1
)

echo.
echo Frontend wird installiert...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Fehler beim Installieren des Frontends
    pause
    exit /b 1
)

echo.
echo Installation abgeschlossen!
echo.
echo Starte Backend und Frontend...
echo.

start "POS Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "POS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Backend und Frontend wurden gestartet!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause


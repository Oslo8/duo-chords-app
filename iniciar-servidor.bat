@echo off
title DuoChords Live Server
cd /d "%~dp0"
echo ========================================================
echo    Iniciando DuoChords Live en http://localhost:5173
echo ========================================================
echo.
npm run dev -- --host --port 5173
pause

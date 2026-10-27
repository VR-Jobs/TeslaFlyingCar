@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or later, then reopen this file.
  pause
  exit /b 1
)
node tools\server.mjs --open
if errorlevel 1 pause

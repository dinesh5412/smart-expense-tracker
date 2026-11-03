@echo off
echo ===================================================
echo   Smart Expense ^& Budget Tracker - React Frontend
echo ===================================================
cd /d "%~dp0frontend"

echo Starting Vite React development server...
echo Frontend will be available at: http://localhost:5173
echo.
npm run dev
pause

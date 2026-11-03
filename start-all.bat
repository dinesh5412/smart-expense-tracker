@echo off
echo ===================================================
echo   Smart Expense ^& Budget Tracker - Full Stack Start
echo ===================================================

echo [1/2] Starting Spring Boot backend in new terminal...
start "Expense Tracker - Spring Boot Backend (Port 8080)" cmd /c "%~dp0run-backend.bat"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Starting React frontend in new terminal...
start "Expense Tracker - React Frontend (Port 5173)" cmd /c "%~dp0run-frontend.bat"

echo.
echo ===================================================
echo Both services launched!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8080/api
echo - H2 Console: http://localhost:8080/h2-console
echo ===================================================

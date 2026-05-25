@echo off
cls
echo ========================================
echo Starting Sports Ecosystem App
echo (MongoDB Atlas - Cloud)
echo ========================================
echo.

REM Clean up old processes
echo Cleaning up old processes...
taskkill /FI "WindowTitle eq Frontend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Backend*" /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend
echo [1/2] Starting Backend...
start "Backend" cmd /k "cd server && node server.js"

REM Wait for Backend
set /a attempts=0
:WAIT_BACKEND
set /a attempts+=1
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":5001" | findstr "LISTENING" >nul
if errorlevel 1 (
    if %attempts% LSS 20 (
        goto WAIT_BACKEND
    ) else (
        echo ERROR: Backend failed to start!
        echo Check the Backend window for errors.
        pause
        exit /b 1
    )
)
echo     Backend ready!

REM Start Frontend
echo [2/2] Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo MongoDB:  Atlas Cloud (mongodb+srv://...)
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Note: Using MongoDB Atlas (cloud database)
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173

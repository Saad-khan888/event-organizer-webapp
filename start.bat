@echo off
cls
echo ========================================
echo Starting Sports Ecosystem App
echo (Local MongoDB)
echo ========================================
echo.

REM Clean up old processes
echo Cleaning up old processes...
taskkill /FI "WindowTitle eq Frontend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq MongoDB*" /F >nul 2>&1
taskkill /IM mongod.exe /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

REM Create MongoDB data directory
if not exist "mongodb-data" mkdir mongodb-data

REM Remove any lock files
if exist "mongodb-data\mongod.lock" del /f /q "mongodb-data\mongod.lock"

REM Start MongoDB WITHOUT journaling (prevents corruption)
echo [1/3] Starting MongoDB (no journal mode)...
start "MongoDB" cmd /k "mongod --dbpath mongodb-data --port 27017 --bind_ip 127.0.0.1 --nojournal"

REM Wait for MongoDB
echo [2/3] Waiting for MongoDB...
set /a attempts=0
:WAIT_MONGO
set /a attempts+=1
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":27017" | findstr "LISTENING" >nul
if errorlevel 1 (
    if %attempts% LSS 20 (
        goto WAIT_MONGO
    ) else (
        echo ERROR: MongoDB failed to start!
        echo Check the MongoDB window for errors.
        pause
        exit /b 1
    )
)
echo     MongoDB ready!

REM Start Backend
echo [3/3] Starting Backend...
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
        pause
        exit /b 1
    )
)
echo     Backend ready!

REM Start Frontend
echo.
echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo MongoDB:  mongodb://localhost:27017 (no journal)
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo IMPORTANT: Always use stop.bat to shutdown!
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173

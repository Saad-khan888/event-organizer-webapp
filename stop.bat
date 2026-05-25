@echo off
cls
echo ========================================
echo Stopping Sports Ecosystem App
echo ========================================
echo.

echo Stopping Frontend...
taskkill /FI "WindowTitle eq Frontend*" /F >nul 2>&1

echo Stopping Backend...
taskkill /FI "WindowTitle eq Backend*" /F >nul 2>&1

echo Stopping MongoDB...
taskkill /FI "WindowTitle eq MongoDB*" /F >nul 2>&1
taskkill /IM mongod.exe /F >nul 2>&1

REM Clean up Node processes
taskkill /IM node.exe /F >nul 2>&1

REM Clean up ports
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| find ":27017" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
timeout /t 2 /nobreak >nul

@echo off
echo ========================================
echo Stopping Sports Ecosystem App
echo (MongoDB Atlas - Cloud)
echo ========================================
echo.

echo Stopping Frontend...
taskkill /FI "WindowTitle eq Frontend*" /F >nul 2>&1

echo Stopping Backend...
taskkill /FI "WindowTitle eq Backend*" /F >nul 2>&1

echo Cleaning up Node processes...
taskkill /IM node.exe /F >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
echo Note: MongoDB Atlas runs in the cloud
echo and doesn't need to be stopped locally.
echo.
pause

@echo off
echo ========================================
echo   DATABASE CLEANUP SCRIPT
echo ========================================
echo.
echo WARNING: This will delete ALL data:
echo   - All users
echo   - All events
echo   - All reports
echo   - All tickets and orders
echo   - All uploaded files
echo.
echo IMPORTANT: You must LOG OUT from the app
echo after running this script!
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo.
    echo Cleanup cancelled.
    pause
    exit /b
)

echo.
echo ========================================
echo Step 1: Stopping server...
echo ========================================
call stop.bat

echo.
echo ========================================
echo Step 2: Cleaning database...
echo ========================================
cd server
node cleanup-database.js
cd ..

echo.
echo ========================================
echo   CLEANUP COMPLETE
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Start the server: start.bat
echo 2. Open the app in browser
echo 3. LOG OUT if you're logged in
echo 4. Sign up with new accounts
echo 5. Test the features
echo.
echo Press any key to start the server...
pause > nul

call start.bat

@echo off
echo ==========================================
echo    AR Debug Helper
echo ==========================================
echo.

REM Check if device is connected
echo [1/3] Checking device connection...
adb devices
echo.

REM Forward port for remote debugging
echo [2/3] Setting up port forwarding...
adb forward tcp:9222 localabstract:chrome_devtools_remote
echo.

REM Open Chrome inspect page
echo [3/3] Opening Chrome DevTools...
start chrome://inspect
echo.

echo ==========================================
echo Setup complete!
echo.
echo INSTRUCTIONS:
echo 1. Make sure your tablet shows "device" (not unauthorized)
echo 2. Open Chrome/Brave on your TABLET
echo 3. Navigate to: https://172.20.3.86:8443
echo 4. In the Chrome window that opened on PC:
echo    - Check "Discover USB devices"
echo    - You should see your page under "Remote Target"
echo    - Click "inspect" to debug
echo.
echo If device shows "unauthorized":
echo    - Accept the popup on your tablet
echo    - Run this script again
echo ==========================================
pause

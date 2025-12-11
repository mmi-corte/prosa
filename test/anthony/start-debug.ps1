# AR Debug Helper Script for PowerShell
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   AR Debug Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
Write-Host "[1/3] Checking device connection..." -ForegroundColor Yellow
adb devices
Write-Host ""

# Forward port for remote debugging
Write-Host "[2/3] Setting up port forwarding..." -ForegroundColor Yellow
adb forward tcp:9222 localabstract:chrome_devtools_remote
Write-Host ""

# Open Chrome inspect page
Write-Host "[3/3] Opening Chrome DevTools..." -ForegroundColor Yellow
Start-Process "chrome://inspect"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor White
Write-Host "1. Make sure your tablet shows 'device' (not unauthorized)" -ForegroundColor White
Write-Host "2. Open Chrome/Brave on your TABLET" -ForegroundColor White
Write-Host "3. Navigate to: https://172.20.3.86:8443" -ForegroundColor White
Write-Host "4. In the Chrome window that opened on PC:" -ForegroundColor White
Write-Host "   - Check 'Discover USB devices'" -ForegroundColor White
Write-Host "   - You should see your page under 'Remote Target'" -ForegroundColor White
Write-Host "   - Click 'inspect' to debug" -ForegroundColor White
Write-Host ""
Write-Host "If device shows 'unauthorized':" -ForegroundColor Red
Write-Host "   - Accept the popup on your tablet" -ForegroundColor Red
Write-Host "   - Run this script again" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

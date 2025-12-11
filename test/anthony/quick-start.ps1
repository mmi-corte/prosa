# Quick Start Script - Run Everything
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   AR Experience - Quick Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"}).IPAddress | Select-Object -First 1
Write-Host "Your IP Address: $ip" -ForegroundColor Green
Write-Host ""

# Start HTTPS server in background
Write-Host "[1/2] Starting HTTPS server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node server.js"
Start-Sleep -Seconds 2
Write-Host "Server started!" -ForegroundColor Green
Write-Host ""

# Setup ADB debugging
Write-Host "[2/2] Setting up USB debugging..." -ForegroundColor Yellow
adb devices
adb forward tcp:9222 localabstract:chrome_devtools_remote
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Everything is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "On your tablet, open:" -ForegroundColor White
Write-Host "https://$ip:8443" -ForegroundColor Cyan
Write-Host ""
Write-Host "For debugging:" -ForegroundColor White
Write-Host "brave://inspect or chrome://inspect" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

@echo off
chcp 65001 >nul
title Arka Plan Kaldir - Kurulum
cd /d "%~dp0"

echo.
echo   Arka Plan Kaldir ve Duzenle - Kurulum
echo   ===================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo   [!] Node.js bulunamadi.
  echo       https://nodejs.org adresinden Node.js kurup bu dosyayi tekrar calistir.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo   Gerekli dosyalar indiriliyor, lutfen bekle...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [!] npm install basarisiz oldu.
    pause
    exit /b 1
  )
)

if not exist "renderer\bgremove.bundle.js" (
  call npm run bundle
)

node tools\kur.mjs
if errorlevel 1 (
  echo.
  echo   [!] Kurulum tamamlanamadi.
  pause
  exit /b 1
)

timeout /t 3 >nul

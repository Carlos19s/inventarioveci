@echo off
title VeciBar - App Vendedora (Movil)
color 0D
cls
echo ========================================================
echo       VECIBAR - APP MOVIL PARA LA VENDEDORA
echo ========================================================
echo.
echo Para abrirla en tu CELULAR:
echo 1. Conecta tu celular al mismo Wi-Fi de esta computadora.
echo 2. Abre Chrome o Safari en tu telefono.
echo 3. Entra a este enlace:
echo.
echo    ---> http://10.244.46.107:5173 <---
echo.
echo (TIP: Toca "Agregar a pantalla principal" para usar como App)
echo ========================================================
echo Iniciando servidor...
cd /d "%~dp0app-vendedora"
if not exist "node_modules" (
  cd /d "C:\Users\Admin\Desktop\App-Vendedora"
)
npm run dev -- --host 0.0.0.0 --port 5173
pause

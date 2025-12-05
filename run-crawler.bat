@echo off
REM Script para ejecutar el crawler de InfoPanama en Windows
REM
REM Uso:
REM   run-crawler.bat              REM Ejecuta crawler completo
REM   run-crawler.bat prensa       REM Solo La Prensa
REM   run-crawler.bat gaceta       REM Solo Gaceta Oficial

echo.
echo ==============================================
echo   Crawler de InfoPanama
echo ==============================================
echo.

REM Verificar que existe el paquete crawler
if not exist "packages\crawler" (
  echo ERROR: No se encuentra el directorio packages\crawler
  exit /b 1
)

REM Verificar que existe .env.local
if not exist ".env.local" (
  echo ERROR: No se encuentra .env.local
  echo        Copia .env.example a .env.local y configura tus API keys
  exit /b 1
)

REM Copiar .env.local al paquete crawler si no existe
if not exist "packages\crawler\.env" (
  echo Copiando configuracion de .env.local a packages\crawler\.env
  copy .env.local packages\crawler\.env
)

cd packages\crawler

REM Instalar dependencias si no existen
if not exist "node_modules" (
  echo Instalando dependencias del crawler...
  call npm install
)

REM Ejecutar el crawler segun el argumento
if "%1"=="prensa" (
  echo.
  echo Crawling La Prensa...
  call npm run crawl:prensa
) else if "%1"=="gaceta" (
  echo.
  echo Crawling Gaceta Oficial...
  call npm run crawl:gaceta
) else (
  echo.
  echo Ejecutando crawler completo ^(todas las fuentes^)...
  call npm run crawl:all
)

echo.
echo ==============================================
echo   Crawler completado
echo ==============================================
echo.
echo Proximos pasos:
echo   1. Los articulos se guardaron automaticamente en Convex
echo   2. Los claims se extrajeron con IA ^(OpenAI GPT-5 mini^)
echo   3. Revisa los claims en: http://localhost:3000/admin/dashboard
echo.

cd ..\..

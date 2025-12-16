# Script de configuración para Digital Ocean (PowerShell/Windows)
# Este script te ayuda a configurar todo lo necesario para el despliegue

Write-Host "🚀 InfoPanama - Setup de Digital Ocean" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar doctl
Write-Host "1️⃣  Verificando doctl CLI..." -ForegroundColor Yellow

$doctlInstalled = Get-Command doctl -ErrorAction SilentlyContinue

if (-not $doctlInstalled) {
    Write-Host "⚠️  doctl no está instalado" -ForegroundColor Red
    Write-Host "   Instalando doctl con Chocolatey..."

    # Verificar si Chocolatey está instalado
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

    if (-not $chocoInstalled) {
        Write-Host "❌ Chocolatey no está instalado" -ForegroundColor Red
        Write-Host "   Instala Chocolatey primero: https://chocolatey.org/install"
        Write-Host "   O descarga doctl manualmente: https://github.com/digitalocean/doctl/releases"
        exit 1
    }

    choco install doctl -y
} else {
    Write-Host "✅ doctl ya está instalado" -ForegroundColor Green
}

# Verificar autenticación
Write-Host ""
Write-Host "2️⃣  Verificando autenticación..." -ForegroundColor Yellow

$accountInfo = doctl account get 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No estás autenticado en Digital Ocean" -ForegroundColor Red
    Write-Host "   Necesitas un API Token de Digital Ocean"
    Write-Host "   Consíguelo en: https://cloud.digitalocean.com/account/api/tokens"
    Write-Host ""
    $doToken = Read-Host "   Pega tu API Token aquí"
    doctl auth init --access-token $doToken
} else {
    Write-Host "✅ Ya estás autenticado" -ForegroundColor Green
}

# Obtener información de la cuenta
$accountEmail = doctl account get --format Email --no-header
Write-Host "   Cuenta: $accountEmail" -ForegroundColor Green

# Verificar si ya existe una app
Write-Host ""
Write-Host "3️⃣  Buscando apps existentes..." -ForegroundColor Yellow

$existingApps = doctl apps list --format ID,Spec.Name --no-header

if ([string]::IsNullOrWhiteSpace($existingApps)) {
    Write-Host "⚠️  No tienes apps en Digital Ocean App Platform" -ForegroundColor Red
    Write-Host "   Necesitas crear una app manualmente primero"
    Write-Host "   Ve a: https://cloud.digitalocean.com/apps"
} else {
    Write-Host "✅ Apps encontradas:" -ForegroundColor Green
    Write-Host $existingApps
}

# Configurar GitHub Secrets
Write-Host ""
Write-Host "4️⃣  Configuración de GitHub Secrets" -ForegroundColor Yellow
Write-Host "   Para habilitar auto-deploy, necesitas configurar estos secrets en GitHub:"
Write-Host ""
Write-Host "   Repository → Settings → Secrets → Actions → New repository secret"
Write-Host ""

# Obtener API token actual
$currentToken = doctl auth list --format Token --no-header | Select-Object -First 1
Write-Host "   DIGITALOCEAN_ACCESS_TOKEN = $currentToken" -ForegroundColor Cyan

# Pedir APP_ID si existe
if (-not [string]::IsNullOrWhiteSpace($existingApps)) {
    Write-Host ""
    $appId = Read-Host "   Ingresa el APP_ID que quieres usar (de la lista de arriba)"
    Write-Host "   DO_APP_ID = $appId" -ForegroundColor Cyan

    # Guardar en archivo .env.deploy (solo local, no commitear)
    @"
# Digital Ocean Configuration
# IMPORTANTE: No commitear este archivo!
DIGITALOCEAN_ACCESS_TOKEN=$currentToken
DO_APP_ID=$appId
"@ | Out-File -FilePath ".env.deploy" -Encoding UTF8

    Write-Host ""
    Write-Host "✅ Configuración guardada en .env.deploy" -ForegroundColor Green
    Write-Host "   (Este archivo está en .gitignore, no se subirá a GitHub)"
}

# Verificar variables de entorno necesarias
Write-Host ""
Write-Host "5️⃣  Variables de entorno requeridas" -ForegroundColor Yellow
Write-Host "   Asegúrate de configurar estas variables en Digital Ocean App Platform:"
Write-Host ""
Write-Host "   • OPENAI_API_KEY"
Write-Host "   • CONVEX_URL"
Write-Host "   • NEXT_PUBLIC_CONVEX_URL"
Write-Host "   • BROWSERBASE_API_KEY"
Write-Host "   • BROWSERBASE_PROJECT_ID"
Write-Host "   • NODE_ENV=production"

# Resumen final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:"
Write-Host ""
Write-Host "1. Crea una app en Digital Ocean App Platform:"
Write-Host "   https://cloud.digitalocean.com/apps/new"
Write-Host ""
Write-Host "2. Configura los GitHub Secrets (si quieres auto-deploy):"
Write-Host "   - DIGITALOCEAN_ACCESS_TOKEN"
Write-Host "   - DO_APP_ID"
Write-Host ""
Write-Host "3. Configura las variables de entorno en la app"
Write-Host ""
Write-Host "4. Deploy! 🚀"
Write-Host ""
Write-Host "📚 Más info: Ver DEPLOY_DIGITAL_OCEAN.md"
Write-Host ""

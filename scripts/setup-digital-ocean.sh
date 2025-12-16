#!/bin/bash

# Script de configuración para Digital Ocean
# Este script te ayuda a configurar todo lo necesario para el despliegue

echo "🚀 InfoPanama - Setup de Digital Ocean"
echo "========================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar doctl
echo "1️⃣  Verificando doctl CLI..."
if ! command_exists doctl; then
    echo -e "${YELLOW}⚠️  doctl no está instalado${NC}"
    echo "   Instalando doctl..."

    # Detectar OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install doctl
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo snap install doctl
    else
        echo -e "${RED}❌ Sistema operativo no soportado${NC}"
        echo "   Instala doctl manualmente: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
else
    echo -e "${GREEN}✅ doctl ya está instalado${NC}"
fi

# Verificar autenticación
echo ""
echo "2️⃣  Verificando autenticación..."
if ! doctl account get >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Digital Ocean${NC}"
    echo "   Necesitas un API Token de Digital Ocean"
    echo "   Consíguelo en: https://cloud.digitalocean.com/account/api/tokens"
    echo ""
    read -p "   Pega tu API Token aquí: " DO_TOKEN
    doctl auth init --access-token "$DO_TOKEN"
else
    echo -e "${GREEN}✅ Ya estás autenticado${NC}"
fi

# Obtener información de la cuenta
ACCOUNT_EMAIL=$(doctl account get --format Email --no-header)
echo -e "${GREEN}   Cuenta: $ACCOUNT_EMAIL${NC}"

# Verificar si ya existe una app
echo ""
echo "3️⃣  Buscando apps existentes..."
EXISTING_APPS=$(doctl apps list --format ID,Spec.Name --no-header)

if [ -z "$EXISTING_APPS" ]; then
    echo -e "${YELLOW}⚠️  No tienes apps en Digital Ocean App Platform${NC}"
    echo "   Necesitas crear una app manualmente primero"
    echo "   Ve a: https://cloud.digitalocean.com/apps"
else
    echo -e "${GREEN}✅ Apps encontradas:${NC}"
    echo "$EXISTING_APPS"
fi

# Configurar GitHub Secrets
echo ""
echo "4️⃣  Configuración de GitHub Secrets"
echo "   Para habilitar auto-deploy, necesitas configurar estos secrets en GitHub:"
echo ""
echo "   Repository → Settings → Secrets → Actions → New repository secret"
echo ""

# Obtener API token actual
CURRENT_TOKEN=$(doctl auth list --format Token --no-header | head -n 1)
echo -e "   ${YELLOW}DIGITALOCEAN_ACCESS_TOKEN${NC} = $CURRENT_TOKEN"

# Pedir APP_ID si existe
if [ -n "$EXISTING_APPS" ]; then
    echo ""
    read -p "   Ingresa el APP_ID que quieres usar (de la lista de arriba): " APP_ID
    echo -e "   ${YELLOW}DO_APP_ID${NC} = $APP_ID"

    # Guardar en archivo .env.deploy (solo local, no commitear)
    cat > .env.deploy << EOF
# Digital Ocean Configuration
# IMPORTANTE: No commitear este archivo!
DIGITALOCEAN_ACCESS_TOKEN=$CURRENT_TOKEN
DO_APP_ID=$APP_ID
EOF

    echo ""
    echo -e "${GREEN}✅ Configuración guardada en .env.deploy${NC}"
    echo "   (Este archivo está en .gitignore, no se subirá a GitHub)"
fi

# Verificar variables de entorno necesarias
echo ""
echo "5️⃣  Variables de entorno requeridas"
echo "   Asegúrate de configurar estas variables en Digital Ocean App Platform:"
echo ""
echo "   • OPENAI_API_KEY"
echo "   • CONVEX_URL"
echo "   • NEXT_PUBLIC_CONVEX_URL"
echo "   • BROWSERBASE_API_KEY"
echo "   • BROWSERBASE_PROJECT_ID"
echo "   • NODE_ENV=production"

# Resumen final
echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup completado!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Crea una app en Digital Ocean App Platform:"
echo "   https://cloud.digitalocean.com/apps/new"
echo ""
echo "2. Configura los GitHub Secrets (si quieres auto-deploy):"
echo "   - DIGITALOCEAN_ACCESS_TOKEN"
echo "   - DO_APP_ID"
echo ""
echo "3. Configura las variables de entorno en la app"
echo ""
echo "4. Deploy! 🚀"
echo ""
echo "📚 Más info: Ver DEPLOY_DIGITAL_OCEAN.md"
echo ""

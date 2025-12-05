#!/bin/bash
#
# Script para ejecutar el crawler de InfoPanama manualmente
# Este script ejecuta el crawler de Playwright que ya está en packages/crawler
#
# Uso:
#   ./run-crawler.sh              # Ejecuta crawler completo
#   ./run-crawler.sh prensa       # Solo La Prensa
#   ./run-crawler.sh gaceta       # Solo Gaceta Oficial
#

set -e  # Exit on error

echo "🚀 Iniciando crawler de InfoPanama"
echo "=================================="
echo ""

# Verificar que existe el paquete crawler
if [ ! -d "packages/crawler" ]; then
  echo "❌ Error: No se encuentra el directorio packages/crawler"
  exit 1
fi

# Verificar que existe .env.local con las credenciales
if [ ! -f ".env.local" ]; then
  echo "❌ Error: No se encuentra .env.local"
  echo "   Copia .env.example a .env.local y configura tus API keys"
  exit 1
fi

# Copiar .env.local al paquete crawler si no existe
if [ ! -f "packages/crawler/.env" ]; then
  echo "📝 Copiando configuración de .env.local a packages/crawler/.env"
  cp .env.local packages/crawler/.env
fi

cd packages/crawler

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias del crawler..."
  npm install
fi

# Ejecutar el crawler según el argumento
case "$1" in
  prensa)
    echo "📰 Crawling La Prensa..."
    npm run crawl:prensa
    ;;
  gaceta)
    echo "🏛️ Crawling Gaceta Oficial..."
    npm run crawl:gaceta
    ;;
  *)
    echo "🔄 Ejecutando crawler completo (todas las fuentes)..."
    npm run crawl:all
    ;;
esac

echo ""
echo "✅ Crawler completado"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Los artículos se guardaron automáticamente en Convex"
echo "   2. Los claims se extrajeron con IA (OpenAI GPT-5 mini)"
echo "   3. Revisa los claims en: http://localhost:3000/admin/dashboard"
echo ""

# 📜 Scripts de Despliegue

Esta carpeta contiene scripts útiles para el despliegue y mantenimiento de InfoPanama.

## 🚀 Setup de Digital Ocean

### Para Windows (PowerShell)

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\setup-digital-ocean.ps1
```

### Para macOS/Linux (Bash)

```bash
# Ejecutar desde la raíz del proyecto
./scripts/setup-digital-ocean.sh
```

## 📋 ¿Qué hace el script?

1. **Verifica doctl CLI**
   - Detecta si está instalado
   - Lo instala automáticamente si falta (macOS/Linux)
   - Te guía a instalarlo manualmente en Windows

2. **Autentica con Digital Ocean**
   - Verifica si ya estás autenticado
   - Si no, te pide el API Token
   - Guarda las credenciales de forma segura

3. **Lista apps existentes**
   - Muestra todas tus apps en Digital Ocean
   - Te ayuda a identificar el APP_ID correcto

4. **Genera configuración local**
   - Crea `.env.deploy` con tus credenciales
   - Este archivo NO se sube a GitHub (está en `.gitignore`)

5. **Te muestra los próximos pasos**
   - Lista de variables de entorno necesarias
   - Instrucciones para configurar GitHub Secrets
   - Links útiles

## 🔑 Variables de Entorno Necesarias

Después de ejecutar el script, necesitarás configurar estas variables en Digital Ocean App Platform:

```bash
# OpenAI (para extracción de claims)
OPENAI_API_KEY=sk-proj-...

# Convex (base de datos)
CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Browserbase (scraping avanzado)
BROWSERBASE_API_KEY=bb_live_...
BROWSERBASE_PROJECT_ID=...

# Node environment
NODE_ENV=production
```

## 🔐 GitHub Secrets

Para habilitar auto-deploy con GitHub Actions, configura estos secrets:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"
4. Agrega:

   - `DIGITALOCEAN_ACCESS_TOKEN`: Tu token de Digital Ocean
   - `DO_APP_ID`: El ID de tu app (lo ves después de crearla)

## 🆘 Troubleshooting

### Error: "doctl: command not found"

**Windows:**
```powershell
# Instala Chocolatey primero
# https://chocolatey.org/install

# Luego instala doctl
choco install doctl -y
```

**macOS:**
```bash
brew install doctl
```

**Linux:**
```bash
sudo snap install doctl
```

### Error: "Auth failed"

Tu API token puede estar expirado o ser inválido.

1. Ve a https://cloud.digitalocean.com/account/api/tokens
2. Genera un nuevo token
3. Ejecuta: `doctl auth init --access-token YOUR_NEW_TOKEN`

### Error: "No apps found"

Necesitas crear tu primera app manualmente en Digital Ocean:

1. Ve a https://cloud.digitalocean.com/apps/new
2. Conecta tu repositorio de GitHub
3. Sigue las instrucciones en `DEPLOY_DIGITAL_OCEAN.md`

## 📚 Documentación Adicional

- [DEPLOY_DIGITAL_OCEAN.md](../DEPLOY_DIGITAL_OCEAN.md) - Guía completa de despliegue
- [BROWSERBASE_SETUP.md](../packages/crawler/BROWSERBASE_SETUP.md) - Configuración de Browserbase
- [Digital Ocean Docs](https://docs.digitalocean.com/products/app-platform/)

## 💡 Tips

- Ejecuta el script cada vez que necesites recordar tu configuración
- Mantén tu `.env.deploy` seguro (nunca lo subas a GitHub)
- Revisa los logs regularmente: `doctl apps logs YOUR_APP_ID --follow`
- Usa el plan de $5/mes para empezar (puedes escalar después)

## 🎯 Siguientes Pasos

Después de ejecutar el script:

1. ✅ Crea una app en Digital Ocean (si no tienes una)
2. ✅ Configura las variables de entorno
3. ✅ Configura GitHub Secrets (para auto-deploy)
4. ✅ Haz push a main → ¡Deploy automático! 🚀

---

**¿Problemas?** Abre un issue en GitHub o consulta la documentación completa.

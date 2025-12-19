# 🔐 Guía de Credenciales - InfoPanama

Esta guía lista **TODAS** las credenciales que necesitas obtener para desplegar InfoPanama.

---

## ✅ Credenciales REQUERIDAS (Obligatorias)

### 1. OpenAI API Key 🤖

**¿Para qué?** Extracción de claims con GPT-4

**Dónde obtenerla:**
1. Ve a https://platform.openai.com/api-keys
2. Click en "Create new secret key"
3. Copia la key (empieza con `sk-proj-` o `sk-`)

**Costo:** Pay-as-you-go (~$5-10/mes para uso normal)

**Variable de entorno:**
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

---

### 2. Convex Deployment URL 🗄️

**¿Para qué?** Base de datos real-time + backend

**Dónde obtenerla:**
1. Ve a https://dashboard.convex.dev
2. Crea un proyecto (si no existe)
3. Copia la **Deployment URL**

**Costo:** Free tier (suficiente para empezar)

**Variables de entorno:**
```bash
CONVEX_URL=https://your-deployment-name.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

**Comandos útiles:**
```bash
# Deploy a Convex
npx convex deploy

# Ver URL actual
npx convex env get CONVEX_URL
```

---

### 3. Clerk Authentication 🔒

**¿Para qué?** Autenticación de usuarios (login/logout en admin panel)

**Dónde obtenerla:**
1. Ve a https://dashboard.clerk.com
2. Crea una aplicación
3. Copia las keys en **API Keys**

**Costo:** Free tier (10,000 MAU)

**Variables de entorno:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
```

---

### 4. Browserbase 🌐

**¿Para qué?** Scraping avanzado de Instagram con anti-detección

**Dónde obtenerla:**
1. Ve a https://www.browserbase.com
2. Sign up
3. Suscríbete al plan **Hobby** ($20/mes)
4. Dashboard → API Keys → Create API Key
5. Dashboard → Projects → Copia el Project ID

**Costo:** $20/mes (100 horas de sesiones)

**Variables de entorno:**
```bash
BROWSERBASE_API_KEY=bb_live_xxxxxxxxxxxxxxxxxx
BROWSERBASE_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Documentación:** Ver [BROWSERBASE_SETUP.md](packages/crawler/BROWSERBASE_SETUP.md)

---

### 5. Digital Ocean API Token 🌊

**¿Para qué?** Desplegar crawlers en la nube

**Dónde obtenerla:**
1. Ve a https://cloud.digitalocean.com/account/api/tokens
2. Click en "Generate New Token"
3. Nombre: "InfoPanama Deploy"
4. Permisos: Read & Write
5. Copia el token (empieza con `dop_v1_`)

**Costo:** $5/mes (Basic plan para crawlers)

**Variable de entorno:**
```bash
DIGITALOCEAN_ACCESS_TOKEN=dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**GitHub Secret:**
- Name: `DIGITALOCEAN_ACCESS_TOKEN`
- Value: tu token

**Uso:**
```bash
# Autenticarte con doctl
doctl auth init --access-token YOUR_TOKEN

# Verificar
doctl account get
```

---

## 🔶 Credenciales OPCIONALES (Recomendadas)

### 6. AntiCaptcha API Key 🔓 (OPCIONAL)

**¿Para qué?** Backup si Browserbase falla resolviendo captchas

**¿Lo necesito?** NO en la mayoría de casos. Browserbase ya resuelve captchas.

**Dónde obtenerla:**
1. Ve a https://anti-captcha.com
2. Sign up
3. Agrega fondos ($5 mínimo)
4. Settings → API Setup → Copia tu API Key

**Costo:** Pay-as-you-go (~$1-5/mes si lo usas)

**Variable de entorno:**
```bash
ANTICAPTCHA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Documentación:** Ver [ANTICAPTCHA_SETUP.md](packages/crawler/ANTICAPTCHA_SETUP.md)

---

## 📋 Resumen de Costos

### Empezar con Free Tiers (RECOMENDADO)

| Servicio | Plan | Costo |
|----------|------|-------|
| OpenAI | Pay-as-you-go | ~$5/mes |
| Convex | Free | $0/mes |
| Clerk | Free | $0/mes |
| Browserbase | Hobby | $20/mes |
| Digital Ocean | Basic | $5/mes |
| AntiCaptcha | (opcional) | $0/mes |
| **TOTAL** | | **$30/mes** |

### Escalar a Producción (cuando crezcan)

| Servicio | Plan | Costo |
|----------|------|-------|
| OpenAI | Pay-as-you-go | ~$10/mes |
| Convex | Professional | $25/mes |
| Clerk | Pro | $25/mes |
| Browserbase | Hobby | $20/mes |
| Digital Ocean | Professional | $12/mes |
| Vercel | Pro | $20/mes |
| **TOTAL** | | **$112/mes** |

---

## 🗂️ Dónde Configurar Cada Credencial

### Frontend (Vercel)
```bash
# En Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### Crawlers (Digital Ocean)
```bash
# En DO App Platform → Settings → Environment Variables
OPENAI_API_KEY=...
CONVEX_URL=...
NEXT_PUBLIC_CONVEX_URL=...
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
ANTICAPTCHA_API_KEY=...  # opcional
NODE_ENV=production
```

### Desarrollo Local
```bash
# En packages/crawler/.env
OPENAI_API_KEY=...
CONVEX_URL=...
NEXT_PUBLIC_CONVEX_URL=...
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
ANTICAPTCHA_API_KEY=...  # opcional
```

### GitHub Secrets (para CI/CD)
```bash
# En GitHub → Settings → Secrets → Actions
DIGITALOCEAN_ACCESS_TOKEN=...
DO_APP_ID=...  # (lo obtienes después de crear la app)
```

---

## ✅ Checklist de Credenciales

Marca cada credencial cuando la obtengas:

### Obligatorias
- [ ] OpenAI API Key
- [ ] Convex Deployment URL
- [ ] Clerk Publishable Key
- [ ] Clerk Secret Key
- [ ] Browserbase API Key
- [ ] Browserbase Project ID
- [ ] Digital Ocean API Token

### Opcionales
- [ ] AntiCaptcha API Key (solo si Browserbase falla)

---

## 🔒 Seguridad de Credenciales

### ✅ HACER:
- ✅ Guardar en gestor de contraseñas (1Password, Bitwarden, etc.)
- ✅ Usar variables de entorno
- ✅ Agregar `.env` a `.gitignore`
- ✅ Rotar keys periódicamente
- ✅ Usar diferentes keys para dev/prod
- ✅ Configurar GitHub Secrets para CI/CD

### ❌ NUNCA:
- ❌ Hardcodear en el código
- ❌ Commitear a Git
- ❌ Compartir en Slack/Discord sin encriptar
- ❌ Usar en URLs públicas
- ❌ Guardar en archivos sin encriptar

---

## 🆘 ¿Perdiste una credencial?

### OpenAI API Key
1. Ve a https://platform.openai.com/api-keys
2. Revoca la key perdida
3. Crea una nueva

### Clerk Keys
1. Dashboard → API Keys
2. Las keys no se pueden ver de nuevo
3. Crea nuevas si las perdiste

### Browserbase
1. Dashboard → Settings → API Keys
2. Revoca la antigua
3. Genera nueva

### Digital Ocean Token
1. https://cloud.digitalocean.com/account/api/tokens
2. Revoca el token anterior
3. Genera uno nuevo

### AntiCaptcha
1. Dashboard → Settings → API Setup
2. Tu API key siempre está visible ahí

---

## 📚 Documentación de Referencia

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Browserbase Docs](https://docs.browserbase.com)
- [Digital Ocean Docs](https://docs.digitalocean.com)
- [AntiCaptcha Docs](https://anti-captcha.com/apidoc)

---

## 💡 Tips

1. **Usa un gestor de contraseñas** - 1Password, Bitwarden, etc.
2. **Documenta qué key es para qué** - No todas se ven iguales
3. **Rota keys cada 90 días** - Especialmente en producción
4. **Monitorea uso** - Verifica que no haya uso sospechoso
5. **Backup de keys** - Guárdalas en lugar seguro

---

## 🎯 Orden Recomendado de Obtención

1. **Convex** (necesaria para desarrollo local)
2. **OpenAI** (necesaria para crawlers)
3. **Clerk** (necesaria para admin panel)
4. **Browserbase** (necesaria para Instagram scraping)
5. **Digital Ocean** (necesaria para deployment)
6. **AntiCaptcha** (solo si Browserbase falla)

**Tiempo estimado:** 1-2 horas para obtener todas las credenciales

---

**¿Listo?** Empieza con el [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

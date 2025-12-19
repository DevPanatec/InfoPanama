# 🔒 Guía de Seguridad - VerificaPty

## ⚠️ IMPORTANTE: API Keys y Secretos

### NO COMMITEAR NUNCA:
- ❌ `.env.local` - Contiene API keys reales
- ❌ Cualquier archivo con `sk-proj-` (OpenAI API keys)
- ❌ Archivos con `pk_live_` o `sk_live_` (Clerk production keys)

### ✅ SÍ COMMITEAR:
- ✅ `.env.example` - Plantilla sin secretos reales

## 🔑 Configuración de API Keys

### 1. OpenAI API Key
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local y agrega tu API key real:
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

**Obtener API key de OpenAI:**
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala y pégala en `.env.local`

### 2. Convex Deployment
```bash
# Ejecuta convex dev para configurar
npx convex dev
```

### 3. Clerk Authentication (Opcional)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 🚨 Si Expusiste una API Key

### Acción Inmediata:
1. Ve a https://platform.openai.com/api-keys
2. **REVOCA** la key expuesta inmediatamente
3. Crea una nueva API key
4. Actualiza `.env.local` con la nueva key
5. Verifica que `.env.local` esté en `.gitignore`
6. NO hagas commit de la nueva key

### Verificar que no esté en Git:
```bash
# Verificar si el archivo está trackeado
git ls-files .env.local

# Si devuelve algo, ELIMÍNALO:
git rm --cached .env.local
git commit -m "Remove exposed API key"
```

## 📋 Checklist de Seguridad

- [ ] `.env.local` está en `.gitignore`
- [ ] `.env.example` no contiene secretos reales
- [ ] API keys de producción son diferentes a las de desarrollo
- [ ] Clerk tiene dominios autorizados configurados
- [ ] CORS está configurado en Convex
- [ ] Rate limiting está implementado en actions costosas

## 🔐 Deployment en Producción

### Vercel:
```bash
# NO uses .env.local en producción
# Configura variables de entorno en Vercel Dashboard:
# Settings > Environment Variables

OPENAI_API_KEY=sk-proj-production-key
OPENAI_MODEL=gpt-4o-mini
```

### Otras Plataformas:
- Usa secretos nativos de la plataforma
- Nunca expongas API keys en el código
- Usa diferentes keys para dev/staging/prod

## 📞 Contacto de Seguridad

Si descubres una vulnerabilidad de seguridad, por favor repórtala a:
- Email: security@verificapty.com
- NO crees issues públicos con detalles de seguridad

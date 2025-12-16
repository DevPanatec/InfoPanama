# ✅ Checklist de Despliegue - InfoPanama

Use esta checklist para asegurarte de que todo esté configurado correctamente antes de ir a producción.

## 📋 Pre-requisitos

- [ ] Cuenta en **Vercel** creada
- [ ] Cuenta en **Digital Ocean** creada
- [ ] Cuenta en **Convex** configurada
- [ ] Cuenta en **Browserbase** configurada
- [ ] Cuenta en **OpenAI** con créditos
- [ ] Cuenta en **Clerk** para autenticación
- [ ] Dominio personalizado (opcional)
- [ ] Repositorio Git configurado

## 🔐 Credenciales y API Keys

### OpenAI
- [ ] API Key obtenida de https://platform.openai.com/api-keys
- [ ] Créditos disponibles ($5+ recomendado)
- [ ] Variable `OPENAI_API_KEY` configurada

### Convex
- [ ] Proyecto creado en https://dashboard.convex.dev
- [ ] `CONVEX_URL` obtenida
- [ ] `npx convex deploy` ejecutado
- [ ] Schema sincronizado
- [ ] Datos de prueba cargados (opcional)

### Browserbase
- [ ] Cuenta creada en https://www.browserbase.com
- [ ] Plan Hobby ($20/mes) activado
- [ ] `BROWSERBASE_API_KEY` obtenida (empieza con `bb_`)
- [ ] `BROWSERBASE_PROJECT_ID` obtenido
- [ ] Variables configuradas en `.env`

### AntiCaptcha (OPCIONAL - solo si Browserbase falla)
- [ ] Cuenta creada en https://anti-captcha.com (opcional)
- [ ] Fondos agregados $5+ (opcional)
- [ ] `ANTICAPTCHA_API_KEY` obtenida (opcional)
- [ ] Variable configurada en `.env` (opcional)
- [ ] Ver [ANTICAPTCHA_SETUP.md](packages/crawler/ANTICAPTCHA_SETUP.md) si es necesario

### Clerk (Autenticación)
- [ ] Aplicación creada en https://dashboard.clerk.com
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` obtenida
- [ ] `CLERK_SECRET_KEY` obtenida
- [ ] Dominio configurado en Clerk Dashboard

### Digital Ocean
- [ ] Cuenta creada
- [ ] API Token generado
- [ ] doctl CLI instalado
- [ ] Autenticación verificada (`doctl account get`)

## 🌐 Frontend (Vercel)

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas en Vercel:
  ```
  NEXT_PUBLIC_CONVEX_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  ```
- [ ] Build exitoso
- [ ] Preview deployment verificado
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL/HTTPS funcionando

## 🤖 Crawlers (Digital Ocean)

- [ ] App creada en Digital Ocean App Platform
- [ ] Tipo de recurso: **Worker** (no Web Service)
- [ ] Build Command configurado:
  ```
  npm install && npm run build --workspace=@infopanama/crawler
  ```
- [ ] Run Command configurado:
  ```
  npm run crawl:all --workspace=@infopanama/crawler
  ```
- [ ] Variables de entorno configuradas:
  ```
  OPENAI_API_KEY
  CONVEX_URL
  NEXT_PUBLIC_CONVEX_URL
  BROWSERBASE_API_KEY
  BROWSERBASE_PROJECT_ID
  NODE_ENV=production
  ```
- [ ] Plan seleccionado: **Basic $5/mes** (512MB RAM)
- [ ] Primer deployment exitoso
- [ ] Logs verificados (sin errores)

## ⏰ Cron Jobs (Crawlers Automáticos)

- [ ] Cron job configurado en Digital Ocean
- [ ] Schedule: `0 13,19,1 * * *` (8am, 2pm, 8pm Panamá)
- [ ] Comando: `npm run crawl:all --workspace=@infopanama/crawler`
- [ ] Primera ejecución verificada
- [ ] Datos apareciendo en Convex

## 🔄 CI/CD (GitHub Actions)

- [ ] Archivo `.github/workflows/deploy-crawler.yml` creado
- [ ] GitHub Secrets configurados:
  - [ ] `DIGITALOCEAN_ACCESS_TOKEN`
  - [ ] `DO_APP_ID`
- [ ] Workflow habilitado
- [ ] Primer auto-deploy exitoso
- [ ] Verificar que deployment se activa en push a `main`

## 🧪 Testing en Producción

### Frontend
- [ ] Página de inicio carga correctamente
- [ ] Navegación funciona
- [ ] Verificaciones se muestran
- [ ] Links de actores funcionan
- [ ] Búsqueda funciona
- [ ] Responsive en móvil

### Admin Panel
- [ ] Login con Clerk funciona
- [ ] Dashboard carga estadísticas
- [ ] Crear nueva verificación funciona
- [ ] Editar verificación funciona
- [ ] Upload de imágenes funciona (si aplica)
- [ ] Grafo OSINT se visualiza

### Crawlers
- [ ] Crawlers ejecutándose según schedule
- [ ] Nuevas noticias aparecen en Convex
- [ ] Instagram scraping funciona (Browserbase)
- [ ] No hay errores en logs
- [ ] Memoria bajo control (<400MB)

## 📊 Monitoreo

- [ ] Logs configurados en Digital Ocean
- [ ] Alerts configurados (opcional)
- [ ] Verificación manual diaria programada
- [ ] Backup strategy definida (Convex hace backups automáticos)

## 🔒 Seguridad

- [ ] Todas las API keys en variables de entorno (no en código)
- [ ] `.env` en `.gitignore`
- [ ] `.env.deploy` en `.gitignore`
- [ ] GitHub Secrets configurados (no en archivos)
- [ ] Clerk permissions configurados correctamente
- [ ] Admin panel solo accesible con autenticación

## 💰 Costos Verificados

- [ ] Vercel: $0-20/mes ✓
- [ ] Convex: $0-25/mes ✓
- [ ] Digital Ocean: $5/mes ✓
- [ ] Browserbase: $20/mes ✓
- [ ] OpenAI: ~$5-10/mes ✓
- [ ] AntiCaptcha: $0-5/mes (opcional, solo si se usa) ✓
- [ ] **Total: ~$30-85/mes** (dependiendo de los planes)

## 📚 Documentación

- [ ] README.md actualizado
- [ ] DEPLOY_DIGITAL_OCEAN.md revisado
- [ ] BROWSERBASE_SETUP.md revisado
- [ ] Credenciales guardadas en lugar seguro (1Password, etc.)
- [ ] Equipo informado sobre el despliegue

## 🎯 Post-Deployment

- [ ] Anunciar lanzamiento en redes sociales
- [ ] Monitorear logs las primeras 24 horas
- [ ] Verificar que crawlers corren 3x/día
- [ ] Recopilar feedback de usuarios
- [ ] Plan de escalamiento definido

## 🆘 Rollback Plan

En caso de que algo salga mal:

### Vercel
```bash
# Rollback en Vercel Dashboard
Deployments → [Previous deployment] → Promote to Production
```

### Digital Ocean
```bash
# Rollback a deployment anterior
doctl apps list-deployments YOUR_APP_ID
doctl apps create-deployment YOUR_APP_ID --deployment-id PREVIOUS_DEPLOYMENT_ID
```

### Convex
```bash
# Convex no requiere rollback (las queries se actualizan automáticamente)
# Si es necesario, restaura desde backup en Convex Dashboard
```

## ✅ Final Check

Antes de marcar como "completado":

- [ ] Todo lo anterior está ✅
- [ ] Platform funcionando en producción por al menos 24 horas sin errores
- [ ] Al menos 3 ejecuciones de crawlers exitosas
- [ ] Al menos 10 verificaciones creadas y publicadas
- [ ] Feedback positivo de usuarios iniciales
- [ ] Equipo capacitado en uso del admin panel

---

**🎉 ¡Felicitaciones!** Tu plataforma de fact-checking está en producción.

**Próximos pasos:**
1. Monitorear durante la primera semana
2. Ajustar crawlers según necesidad
3. Agregar más medios de comunicación
4. Mejorar algoritmo de detección de claims
5. Expandir equipo de verificadores

---

**Fecha de despliegue:** _____________

**Responsable:** _____________

**Versión:** 1.0.0

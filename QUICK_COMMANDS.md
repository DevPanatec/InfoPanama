# ⚡ Comandos Rápidos - InfoPanama

Referencia rápida de comandos útiles para desarrollo y despliegue.

---

## 🚀 Development

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo (frontend)
npm run dev

# Iniciar solo el crawler
cd packages/crawler
npm run crawl:all

# Ver logs de Convex en tiempo real
npx convex dev
```

---

## 🕷️ Crawlers

```bash
# Ejecutar todos los crawlers
npm run crawl:all --workspace=@infopanama/crawler

# Crawlers individuales
npm run crawl:prensa --workspace=@infopanama/crawler
npm run crawl:gaceta --workspace=@infopanama/crawler

# Crawler de Instagram (requiere Browserbase)
# Se ejecuta automáticamente con crawl:all

# Procesar claims con IA
npm run extract:claims --workspace=@infopanama/crawler
```

---

## 🐳 Docker

```bash
# Build imagen
docker build -t infopanama-crawler .

# Ejecutar crawler en Docker
docker run --env-file .env infopanama-crawler

# Docker Compose (si tienes backend completo)
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 🌊 Digital Ocean (doctl)

### Instalación

```bash
# Windows (Chocolatey)
choco install doctl

# macOS
brew install doctl

# Linux
sudo snap install doctl
```

### Autenticación

```bash
# Inicializar doctl
doctl auth init

# Verificar autenticación
doctl account get

# Listar contextos
doctl auth list
```

### Apps

```bash
# Listar todas tus apps
doctl apps list

# Ver detalles de una app
doctl apps get YOUR_APP_ID

# Ver logs en tiempo real
doctl apps logs YOUR_APP_ID --type=run --follow

# Ver logs de build
doctl apps logs YOUR_APP_ID --type=build

# Ver deployments
doctl apps list-deployments YOUR_APP_ID

# Trigger nuevo deployment
doctl apps create-deployment YOUR_APP_ID

# Ver especificación de la app (YAML)
doctl apps spec get YOUR_APP_ID

# Actualizar app desde spec
doctl apps update YOUR_APP_ID --spec spec.yaml
```

### Debugging

```bash
# Ver últimos 100 logs
doctl apps logs YOUR_APP_ID --type=run --tail 100

# Filtrar logs por patrón
doctl apps logs YOUR_APP_ID --type=run --follow | grep "ERROR"

# Ver métricas de la app
doctl apps list --format ID,Spec.Name,ActiveDeployment.Phase,UpdatedAt

# Ver variables de entorno
doctl apps spec get YOUR_APP_ID | grep -A 20 "envs:"
```

---

## 📦 Convex

```bash
# Desarrollo local
npx convex dev

# Deploy a producción
npx convex deploy

# Ver logs
npx convex logs

# Ejecutar función manualmente
npx convex run claims:list

# Importar datos
npx convex import --table claims data.json

# Exportar datos
npx convex export --table claims > backup.json

# Ver schema
cat packages/convex/convex/schema.ts
```

---

## 🔧 Git & GitHub

```bash
# Status
git status

# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Commit
git add .
git commit -m "feat: descripción del cambio"

# Push y crear PR
git push -u origin feature/nueva-funcionalidad

# Sync con main
git checkout main
git pull origin main
git checkout feature/nueva-funcionalidad
git merge main

# Rollback a commit anterior
git log --oneline
git reset --hard COMMIT_HASH
```

### GitHub Actions

```bash
# Ver status de workflows
gh workflow list

# Ver runs
gh run list

# Ver logs de un run
gh run view RUN_ID --log

# Re-run un workflow fallido
gh run rerun RUN_ID

# Trigger workflow manual
gh workflow run deploy-crawler.yml
```

---

## 🔍 Debugging

### Ver logs localmente

```bash
# Ver logs del crawler
tail -f packages/crawler/crawler.log

# Buscar errores
grep -i "error" packages/crawler/crawler.log

# Ver últimas 50 líneas
tail -50 packages/crawler/crawler.log
```

### Browserbase

```bash
# Verificar conexión
curl -X GET "https://api.browserbase.com/v1/sessions" \
  -H "Authorization: Bearer $BROWSERBASE_API_KEY"

# Ver sesiones activas
curl "https://api.browserbase.com/v1/sessions?status=RUNNING" \
  -H "Authorization: Bearer $BROWSERBASE_API_KEY"
```

### AntiCaptcha

```bash
# Verificar balance (Node.js)
node -e "const ac = require('@antiadmin/anticaptchaofficial'); \
  ac.setAPIKey('$ANTICAPTCHA_API_KEY'); \
  ac.getBalance().then(b => console.log('Balance: $' + b))"

# Verificar API key (curl)
curl -X POST "https://api.anti-captcha.com/getBalance" \
  -H "Content-Type: application/json" \
  -d "{\"clientKey\":\"$ANTICAPTCHA_API_KEY\"}"

# Ver estadísticas en dashboard
# https://anti-captcha.com/clients/finance/history
```

### Healthchecks

```bash
# Ping frontend (Vercel)
curl https://tu-dominio.vercel.app/api/health

# Verificar Convex
curl https://your-deployment.convex.cloud/.well-known/deployment

# Test crawler endpoint (si expones uno)
curl http://localhost:3001/health
```

---

## 📊 Monitoreo

### Digital Ocean Metrics

```bash
# CPU y memoria
doctl apps list --format ID,Spec.Name,ActiveDeployment.Phase

# Ver alertas (si configuraste)
doctl monitoring alert list
```

### Logs con filtros útiles

```bash
# Solo errores
doctl apps logs YOUR_APP_ID --follow | grep -i "error\|exception\|failed"

# Solo crawlers exitosos
doctl apps logs YOUR_APP_ID --follow | grep "✅"

# Solo warnings
doctl apps logs YOUR_APP_ID --follow | grep "⚠️\|WARNING"

# Performance (tiempo de ejecución)
doctl apps logs YOUR_APP_ID --follow | grep "Completado en"
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage

# Test específico
npm test -- --grep "crawler"

# Watch mode
npm test -- --watch
```

---

## 🔐 Secrets Management

### Convex Secrets

```bash
# Set secret
npx convex env set OPENAI_API_KEY sk-proj-xxx

# List secrets
npx convex env list

# Remove secret
npx convex env remove OPENAI_API_KEY
```

### GitHub Secrets (via UI o gh CLI)

```bash
# Set secret via gh CLI
gh secret set DIGITALOCEAN_ACCESS_TOKEN < token.txt

# List secrets
gh secret list

# Delete secret
gh secret delete SECRET_NAME
```

---

## 🧹 Maintenance

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar cache de npm
npm cache clean --force

# Limpiar builds
rm -rf .next dist build

# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json
npm install

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

## 📈 Performance

```bash
# Analizar bundle size (Next.js)
npm run build
ANALYZE=true npm run build

# Ver tiempo de build
time npm run build

# Lighthouse audit
npx lighthouse https://tu-dominio.com --view

# Check de Playwright
npx playwright install --dry-run
```

---

## 🆘 Rollback

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote DEPLOYMENT_URL
```

### Digital Ocean

```bash
# List deployments
doctl apps list-deployments YOUR_APP_ID

# Rollback to previous
doctl apps create-deployment YOUR_APP_ID \
  --deployment-id PREVIOUS_DEPLOYMENT_ID
```

### Git

```bash
# Revert último commit (crea nuevo commit)
git revert HEAD

# Reset a commit anterior (borra historia - ¡cuidado!)
git reset --hard COMMIT_HASH
git push --force
```

---

## 📱 Shortcuts

```bash
# Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'

alias do-logs='doctl apps logs'
alias do-list='doctl apps list'
alias do-deploy='doctl apps create-deployment'

alias gs='git status'
alias gc='git commit -m'
alias gp='git push'
alias gl='git pull'

# Crawler rápido
alias crawl='npm run crawl:all --workspace=@infopanama/crawler'
```

---

## 🎯 Comandos Más Usados (Top 10)

```bash
# 1. Ver logs en producción
doctl apps logs YOUR_APP_ID --follow

# 2. Trigger deploy manual
doctl apps create-deployment YOUR_APP_ID

# 3. Ejecutar crawlers
npm run crawl:all --workspace=@infopanama/crawler

# 4. Ver Convex logs
npx convex logs

# 5. Deploy frontend
git push origin main  # Auto-deploy en Vercel

# 6. Status de la app
doctl apps get YOUR_APP_ID

# 7. Ver últimos commits
git log --oneline -10

# 8. Verificar autenticación
doctl account get

# 9. List deployments
doctl apps list-deployments YOUR_APP_ID

# 10. Build local
npm run build
```

---

## 💡 Tips

- **Siempre revisa logs primero** cuando algo falle
- **Usa `--follow`** para ver logs en tiempo real
- **Guarda tu APP_ID** en `.env.deploy` para no tener que buscarlo
- **Crea aliases** para comandos que uses frecuentemente
- **Documenta** cualquier comando nuevo que descubras útil

---

**¿Falta algún comando?** ¡Agrégalo aquí! 📝

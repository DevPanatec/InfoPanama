# 🔒 Guía de Seguridad - InfoPanama

## ✅ Variables de Entorno Protegidas

Este proyecto usa variables de entorno para **TODAS** las credenciales sensibles. Nunca exponemos secrets en el código.

### Archivos `.env` (NUNCA subir a GitHub)

Los siguientes archivos contienen información sensible y están protegidos por `.gitignore`:

- `apps/web/.env.local` - Variables de Next.js (Convex URL, Clerk keys)
- `packages/crawler/.env` - Variables del crawler (OpenAI API key)
- Cualquier archivo `.env*` excepto `.env.example`

### Archivos `.env.example` (SÍ se suben a GitHub)

Estos archivos **NO contienen valores reales**, solo documentan qué variables se necesitan:

- `apps/web/.env.example`
- `packages/crawler/.env.example`

---

## 🔑 Secrets de GitHub Actions

Para que el crawler automático funcione, debes configurar estos secrets en GitHub:

**Ruta:** `Settings` → `Secrets and variables` → `Actions`

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `CONVEX_URL` | URL de tu base de datos Convex | `https://tu-proyecto.convex.cloud` |
| `OPENAI_API_KEY` | API key de OpenAI para extracción de claims | `sk-proj-...` |

**⚠️ IMPORTANTE:** Estos secrets NUNCA se exponen en logs ni en el código público.

---

## 🛡️ Protecciones Implementadas

### 1. `.gitignore` Configurado
✅ Todos los archivos `.env` están ignorados
✅ No se suben credenciales a GitHub
✅ Archivos de ejemplo (.env.example) sí se incluyen

### 2. Variables de Entorno en Código
✅ Siempre usamos `process.env.VARIABLE_NAME`
✅ Validamos que existan antes de usar
✅ Nunca hardcodeamos API keys

### 3. Robots.txt
✅ Bloquea `/admin/` para crawlers
✅ Bloquea `/api/` para evitar descubrimiento
✅ Bloquea `/test-db/` páginas de prueba

### 4. Error Boundaries
✅ Errores NO exponen stack traces en producción
✅ Solo se muestran en modo desarrollo
✅ Error IDs para soporte sin exponer detalles

---

## 🚫 QUÉ NUNCA HACER

❌ **NUNCA** subir archivos `.env` a GitHub
❌ **NUNCA** hardcodear API keys en el código
❌ **NUNCA** commitear credenciales en comentarios
❌ **NUNCA** loggear secrets en consola en producción
❌ **NUNCA** deshabilitar `.gitignore` para archivos `.env`

---

## ✅ CHECKLIST antes de hacer PUSH

Antes de `git push`, verifica:

- [ ] No hay archivos `.env` en `git status`
- [ ] No hay API keys en el código (`grep -r "sk-proj-"`)
- [ ] No hay passwords hardcodeadas
- [ ] `.gitignore` está actualizado
- [ ] Solo `.env.example` tiene ejemplos (sin valores reales)

---

## 🔍 Cómo Verificar Seguridad

```bash
# 1. Verificar que .env NO esté rastreado
git status | grep ".env"
# Debe estar vacío o solo mostrar .env.example

# 2. Buscar API keys expuestas
grep -r "sk-proj-" apps/web/src packages/
# No debe encontrar nada

# 3. Buscar passwords hardcodeados
grep -ri "password.*=" apps/web/src packages/
# Solo debe mostrar placeholders o ejemplos

# 4. Verificar .gitignore
cat .gitignore | grep "\.env"
# Debe incluir .env y .env*.local
```

---

## 📞 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** crear un issue público
2. Contactar directamente al equipo
3. Esperar confirmación antes de divulgar

---

## 🔄 Rotación de Secrets

Si un secret se expone accidentalmente:

1. **Inmediatamente** rotar la credencial en el servicio origen
2. Actualizar el secret en GitHub Actions
3. Actualizar archivos `.env` locales
4. Verificar logs para detectar uso no autorizado
5. Considerar `git filter-branch` para eliminar del historial

---

Última actualización: 23 de Diciembre de 2025

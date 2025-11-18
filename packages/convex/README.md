# @infopanama/convex

Backend de base de datos usando Convex para InfoPanama.

## 📦 Estructura

```
convex/
├── schema.ts                    # Definición del schema completo
├── claims.ts                    # Queries y mutations para claims
├── verdicts.ts                  # Gestión de veredictos
├── actors.ts                    # Actores y debida diligencia
├── probableResponsibles.ts      # Análisis de responsables
├── auditLogs.ts                 # Logs de auditoría inmutables
└── _generated/                  # Código generado (gitignored)
```

## 🚀 Setup

### 1. Instalar Convex CLI

```bash
npm install -g convex
```

### 2. Inicializar Convex

```bash
cd packages/convex
npx convex dev
```

Esto te pedirá:
1. Autenticarte en Convex
2. Crear un nuevo proyecto
3. Generará el código en `convex/_generated/`

### 3. Variables de Entorno

Copia las variables generadas al `.env.local` en la raíz del monorepo:

```bash
CONVEX_DEPLOYMENT=<tu-deployment>
NEXT_PUBLIC_CONVEX_URL=<tu-url>
```

## 📊 Schema

El schema incluye las siguientes tablas principales:

### Claims y Verificación
- **claims**: Afirmaciones a verificar
- **verdicts**: Resultados de verificación con evidencia
- **probableResponsibles**: Análisis de posibles responsables

### Contenido
- **articles**: Artículos scrapeados
- **sources**: Fuentes de información (medios, oficiales)
- **snapshots**: Snapshots de páginas web en DO Spaces
- **entities**: Entidades extraídas (NER)

### Debida Diligencia
- **actors**: Actores informativos con análisis DD
  - Tipos: person, group, troll_network, botnet, HB, etc.
  - Perfilamiento KYA (Know Your Actor)
  - Índice de Riesgo Informativo (IRI)
  - Cumplimiento según leyes panameñas

### Sistema
- **topics**: Categorías y temas
- **events**: Eventos gubernamentales
- **comments**: Comentarios de usuarios
- **users**: Usuarios con roles RBAC
- **auditLogs**: Logs inmutables de todas las acciones
- **systemConfig**: Configuración del sistema

## 🔍 Queries Principales

### Claims

```typescript
// Listar claims
const claims = await ctx.db.query('claims')
  .filter(q => q.eq(q.field('status'), 'published'))
  .order('desc')
  .take(10)

// Buscar claims
const results = await ctx.db
  .query('claims')
  .withSearchIndex('search_claims', q =>
    q.search('claimText', 'gobierno')
  )
  .take(20)
```

### Actores y DD

```typescript
// Actores de alto riesgo
const highRisk = await ctx.db
  .query('actors')
  .withIndex('by_risk', q => q.eq('riskLevel', 'HIGH'))
  .collect()

// Actores tipo HB
const hombresBlanco = await ctx.db
  .query('actors')
  .withIndex('by_type', q => q.eq('type', 'HB'))
  .collect()
```

## 🔐 Seguridad

### Audit Logs
Todos los cambios críticos deben registrarse en `auditLogs`:

```typescript
// Crear log de actualización
await ctx.runMutation(api.auditLogs.logUpdate, {
  userId: user._id,
  userEmail: user.email,
  entityType: 'claims',
  entityId: claimId,
  before: oldData,
  after: newData,
  ipAddress: request.ip,
  userAgent: request.headers['user-agent']
})
```

**IMPORTANTE**: Los audit logs son INMUTABLES. No hay funciones de edición o eliminación.

## 🔄 Indexación

El schema incluye índices optimizados:

- **by_status**: Para filtrar por estado
- **by_risk**: Para filtrar por nivel de riesgo
- **by_type**: Para filtrar por tipo de actor
- **search_***: Full-text search indexes

## 📚 Funciones API

### Claims
- `api.claims.list({ status, limit })`
- `api.claims.getById({ id })`
- `api.claims.search({ query, filters })`
- `api.claims.create({ ...data })`
- `api.claims.updateStatus({ id, status })`
- `api.claims.stats()`

### Verdicts
- `api.verdicts.getByClaimId({ claimId })`
- `api.verdicts.create({ ...data })`
- `api.verdicts.validate({ verdictId, userId })`
- `api.verdicts.stats()`

### Actors
- `api.actors.list({ type, riskLevel, kyaStatus })`
- `api.actors.search({ query })`
- `api.actors.create({ ...data })`
- `api.actors.updateRisk({ id, riskLevel, riskScore })`
- `api.actors.completeDueDiligence({ ...data })`
- `api.actors.stats()`

### Probable Responsibles
- `api.probableResponsibles.getByClaimId({ claimId })`
- `api.probableResponsibles.create({ ...data })`
- `api.probableResponsibles.validate({ id, status })`
- `api.probableResponsibles.topResponsibles({ limit })`

### Audit Logs
- `api.auditLogs.recent({ limit })`
- `api.auditLogs.getByUser({ userId })`
- `api.auditLogs.getByEntity({ entityType, entityId })`
- `api.auditLogs.logCreate({ ...data })`
- `api.auditLogs.logUpdate({ ...data })`

## 🧪 Testing

```bash
# Tests locales con Convex
npm run test
```

## 🚀 Deploy

```bash
# Deploy a producción
npx convex deploy --prod

# Deploy específico
npx convex deploy --name infopanama-prod
```

## 📖 Documentación

- [Convex Docs](https://docs.convex.dev/)
- [Next.js Integration](https://docs.convex.dev/client/react/nextjs/)
- [Database Queries](https://docs.convex.dev/database/reading-data)
- [Full-Text Search](https://docs.convex.dev/text-search)

## 🔗 Uso en Apps

### Web Frontend

```typescript
// app/ConvexClientProvider.tsx
'use client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

// En componentes
import { useQuery, useMutation } from 'convex/react'
import { api } from '@infopanama/convex'

function ClaimsList() {
  const claims = useQuery(api.claims.publicClaims, { limit: 10 })
  const createClaim = useMutation(api.claims.create)

  // ...
}
```

### FastAPI Backend

```python
from convex import ConvexClient

client = ConvexClient(deployment_url=os.getenv("CONVEX_DEPLOYMENT"))

# Query
claims = client.query("claims:list", {"status": "published"})

# Mutation
claim_id = client.mutation("claims:create", {
    "title": "Nueva claim",
    "claimText": "...",
    "sourceType": "auto_extracted"
})
```

## 🎯 Próximos Pasos

- [ ] Agregar funciones para `articles`
- [ ] Agregar funciones para `sources`
- [ ] Agregar funciones para `events`
- [ ] Agregar funciones para `comments`
- [ ] Implementar webhooks
- [ ] Configurar realtime subscriptions

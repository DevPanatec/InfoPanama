# 🕸️ Plan de Implementación - Sistema de Grafos OSINT

## 🎯 OBJETIVO
Crear un sistema visual e interactivo de grafos que muestre relaciones entre actores políticos, medios y organizaciones en Panamá, alimentado por IA y datos OSINT.

---

## 📊 ESTADO ACTUAL (29 Nov 2024)

### ✅ **COMPLETADO (60%)**

#### ÉPICA 1: Recopilación Automática - 70%
- [x] Crawlers de La Prensa y Gaceta Oficial
- [x] Pipeline de extracción de claims con IA
- [x] Cron jobs automáticos cada 6 horas
- [x] Normalización básica de datos
- [ ] **FALTA**: Hash deduplicación, más fuentes

#### ÉPICA 2: IA y Procesamiento - 50%
- [x] Sistema de verificación con GPT-5 mini
- [x] Extracción de entidades (`graphAnalysis.ts`)
- [x] Detección de relaciones con IA
- [x] Sistema de co-menciones automático
- [x] 50 ejemplos de entrenamiento sobre Panamá
- [ ] **FALTA**: NER para Panamá, POI database, scoring

#### ÉPICA 3: Almacenamiento - 80%
- [x] Schema completo en Convex (actors, entities, entityRelations)
- [x] CRUD para nodos y relaciones
- [x] API de consultas eficientes
- [x] Metadatos y evidencia temporal
- [ ] **FALTA**: Merge automático, historial

### ❌ **PENDIENTE (40%)**

#### ÉPICA 4: Visualización Interactiva - 0% ⚠️ CRÍTICO
- [ ] Integrar librería de grafos (Vis.js / Cytoscape.js)
- [ ] Componente `<MediaGraph />` funcional
- [ ] Panel lateral con detalles de nodos
- [ ] Filtros por fecha, tipo, confianza
- [ ] Zoom, pan, selección de nodos
- [ ] Tooltips y hover states

#### ÉPICA 5: UX/UI - 20%
- [x] Wireframes básicos en `media-graph/page.tsx`
- [ ] Diseño visual profesional
- [ ] Versión responsive (mobile/desktop)
- [ ] Colores y estética OSINT

#### ÉPICA 6: Panel Admin - 30%
- [x] Panel base de actores (`/admin/dashboard/actores`)
- [ ] CRUD manual de nodos desde admin
- [ ] Sistema de sugerencias de IA
- [ ] Roles y permisos granulares
- [ ] Alertas automáticas

#### ÉPICA 7: Monitoreo - 10%
- [x] Logs básicos en Convex
- [ ] Métricas de performance
- [ ] Alertas de scraping fallido
- [ ] Dashboard de calidad de datos

---

## 🚀 PLAN DE ACCIÓN - PRÓXIMOS PASOS

### **FASE 1: VISUALIZACIÓN BÁSICA (1-2 días)**
**Prioridad: MÁXIMA**

#### Tarea 1.1: Instalar librería de grafos
```bash
npm install vis-network vis-data --workspace=web
```

#### Tarea 1.2: Implementar componente básico
- Archivo: `apps/web/src/components/graph/NetworkGraph.tsx`
- Renderizar nodos desde `api.entityRelations.getGraphData`
- Configurar interactividad básica (zoom, pan)

#### Tarea 1.3: Conectar con datos reales
- Query desde Convex
- Mapear actores → nodos
- Mapear relaciones → edges

#### Tarea 1.4: Panel de detalles
- Componente `<NodeDetailsPanel />`
- Mostrar info al hacer clic en nodo
- Evidencia, fuentes, timestamps

---

### **FASE 2: ENRIQUECIMIENTO DE DATOS (2-3 días)**

#### Tarea 2.1: POI Database
- Crear lista inicial de Personas de Interés
- Schema ampliado con `poi` table
- Categorías: político, empresario, periodista, etc.

#### Tarea 2.2: NER específico para Panamá
- Diccionario de entidades panameñas
- Fine-tuning del modelo de extracción
- Mayor precisión en nombres locales

#### Tarea 2.3: Score de confiabilidad
- Sistema de puntuación por fuente
- Validación cruzada de relaciones
- Indicador visual en el grafo

---

### **FASE 3: FEATURES AVANZADAS (3-4 días)**

#### Tarea 3.1: Filtros avanzados
- Timeline (filtro por fecha)
- Por tipo de relación
- Por nivel de confianza
- Por categoría de actor

#### Tarea 3.2: Subgrafos
- Ver solo conexiones de un nodo
- Expandir/colapsar grupos
- Búsqueda de caminos entre nodos

#### Tarea 3.3: Exportación
- Imagen PNG del grafo
- JSON de datos
- CSV de relaciones

---

### **FASE 4: PANEL ADMIN COMPLETO (2-3 días)**

#### Tarea 4.1: Gestión manual
- Crear/editar/eliminar nodos desde UI
- Validar duplicados antes de crear
- Merge de entidades similares

#### Tarea 4.2: Sugerencias de IA
- Panel de "relaciones sugeridas"
- Aprobar/rechazar sugerencias
- Feedback loop para mejorar modelo

#### Tarea 4.3: Alertas automáticas
- POI con muchas menciones recientes
- Nuevas relaciones detectadas
- Relaciones contradictorias

---

### **FASE 5: OPTIMIZACIÓN Y PULIDO (2-3 días)**

#### Tarea 5.1: Performance
- Lazy loading de nodos
- Paginación de relaciones
- Cache de queries frecuentes

#### Tarea 5.2: UX/UI final
- Animaciones suaves
- Estados de loading
- Mensajes de error claros

#### Tarea 5.3: Mobile responsive
- Adaptación a pantallas pequeñas
- Gestos táctiles (pinch zoom)

---

## 📋 ÉPICAS DETALLADAS

### ÉPICA 4: Visualización Interactiva (PRÓXIMA)

#### Feature 4.1: Librería de Grafos
**Decisión: Vis.js Network**
- ✅ Fácil integración con React
- ✅ Buen rendimiento con 100-500 nodos
- ✅ Muchas opciones de personalización
- ✅ Documentación excelente

**Alternativas consideradas:**
- Cytoscape.js (más complejo)
- Sigma.js (mejor para grafos enormes)
- D3.js (demasiado low-level)

**Tareas:**
1. `npm install vis-network vis-data`
2. Crear `<NetworkGraph />` component
3. Configurar opciones básicas (physics, layout)
4. Implementar eventos (click, hover, zoom)

#### Feature 4.2: Panel de Detalles
**Componente: `<NodeDetailsPanel />`**

**Estructura:**
```tsx
interface NodeDetails {
  id: string
  name: string
  type: 'person' | 'organization' | 'media' | 'event'
  metadata: {
    position?: string
    affiliation?: string
    description?: string
  }
  connections: Connection[]
  evidence: Evidence[]
  timeline: TimelineEvent[]
}
```

**Tareas:**
1. Diseño del panel lateral
2. Fetch de datos al seleccionar nodo
3. Tabs: Info, Conexiones, Evidencia, Timeline
4. Links a fuentes externas

#### Feature 4.3: Filtros Interactivos
**Componente: `<GraphFilters />`**

**Filtros necesarios:**
- **Fecha**: Date range picker
- **Tipo de relación**: owns, works_for, affiliated_with, etc.
- **Nivel de confianza**: Slider 0-100%
- **Tipo de entidad**: person, org, media, event
- **Fuente**: Qué medio lo reportó

**Tareas:**
1. UI de filtros en sidebar
2. Query params para persistir filtros
3. Actualización reactiva del grafo
4. "Reset filters" button

---

## 🔧 STACK TÉCNICO

### Frontend
- **React 18** + **Next.js 15**
- **Vis.js Network** - Visualización de grafos
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Convex React** - State management

### Backend
- **Convex** - Database + Backend
- **OpenAI GPT-5 mini** - IA para análisis
- **Playwright** - Web scraping

### Data Pipeline
- **Crawlers** → **IA Extraction** → **Convex DB** → **Graph API** → **Vis.js**

---

## 📐 ARQUITECTURA DEL GRAFO

### Tipos de Nodos
```typescript
type NodeType =
  | 'person'        // Político, figura pública
  | 'organization'  // Partido, empresa, ONG
  | 'media'         // Periódico, TV, radio
  | 'event'         // Reunión, conferencia
  | 'poi'           // Person of Interest (especial)
```

### Tipos de Relaciones
```typescript
type RelationType =
  | 'owns'              // Propiedad
  | 'works_for'         // Empleo
  | 'affiliated_with'   // Afiliación
  | 'mentioned_with'    // Co-mención
  | 'quoted_by'         // Citado por
  | 'covers'            // Medio cubre a persona
  | 'attended'          // Asistió a evento
  | 'supports'          // Apoyo
  | 'opposes'           // Oposición
  | 'related_to'        // Genérico
```

### Propiedades de Relaciones
```typescript
interface Relation {
  sourceId: string
  targetId: string
  type: RelationType
  strength: number      // 0-100
  confidence: number    // 0-100
  sentiment: number     // -100 a 100
  context: string       // Descripción
  evidence: string[]    // URLs de fuentes
  timestamp: number     // Cuándo se detectó
  verifiedBy?: string   // Admin que lo validó
}
```

---

## 🎨 DISEÑO VISUAL

### Código de Colores
- **Person (político)**: `#3B82F6` (azul)
- **Organization**: `#8B5CF6` (morado)
- **Media**: `#EF4444` (rojo)
- **Event**: `#10B981` (verde)
- **POI**: `#F59E0B` (naranja)

### Tamaño de Nodos
Basado en **relevancia**:
- Menciones frecuentes → nodo más grande
- Pocas menciones → nodo pequeño

### Grosor de Edges
Basado en **strength**:
- Alta strength (80-100) → línea gruesa
- Media strength (50-79) → línea media
- Baja strength (0-49) → línea delgada

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Técnicos
- [ ] Grafo renderiza en < 2 segundos
- [ ] Soporta mínimo 200 nodos sin lag
- [ ] 0 errores en producción por 7 días
- [ ] API response time < 500ms

### KPIs de Producto
- [ ] Usuarios pueden encontrar conexiones relevantes en < 30s
- [ ] Panel admin permite validar 10 relaciones/minuto
- [ ] Tasa de precisión de IA > 80%
- [ ] Usuarios reportan utilidad (feedback)

---

## 🚦 PRÓXIMO PASO INMEDIATO

**AHORA MISMO vamos a:**
1. Crear el componente `<NetworkGraph />` con Vis.js
2. Conectarlo con los datos que ya existen en Convex
3. Hacer que el grafo OSINT sea funcional y visible

¿Empezamos? 🚀

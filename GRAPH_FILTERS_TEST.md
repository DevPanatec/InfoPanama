# Guía de Testing: Filtros del Grafo OSINT

## Resumen de Cambios

Se han implementado y corregido los siguientes filtros en el grafo OSINT:

1. ✅ **Búsqueda de entidades** - Buscar y centrar en nodos específicos
2. ✅ **Zoom/Dimensiones** - Control de zoom del grafo (50% - 200%)
3. ✅ **Fuerza mínima** - Filtrar conexiones por fortaleza (0% - 100%)
4. ✅ **Tipos de entidad** - Filtrar por Persona, Organización, Medio, Evento, POI
5. ✅ **Tipos de relación** - Filtrar por tipo de conexión (propiedad, trabaja para, etc.)
6. ✅ **Nodos aislados** - Mostrar/ocultar nodos sin conexiones

## Instrucciones de Testing

### 1. Búsqueda de Entidades

**Pasos:**
1. Abre el panel de filtros (botón "Filtros" arriba a la derecha)
2. En el campo "Buscar Entidad", escribe el nombre de una entidad (ej: "Sicarelli", "Mulino")
3. El grafo debe:
   - Centrar automáticamente en el nodo encontrado
   - Hacer zoom a 1.5x sobre ese nodo
   - Seleccionar visualmente el nodo (borde más grueso)

**Verificar en consola:**
```
🔎 Nodo encontrado: "José Raúl Mulino" (k173mg2...)
```

**Si no encuentra:**
```
❌ No se encontró ningún nodo que coincida con: "xyz"
```

### 2. Control de Zoom/Dimensiones

**Pasos:**
1. Mueve el slider "Dimensiones/Zoom" entre 50% y 200%
2. El grafo debe hacer zoom in/out suavemente
3. El cambio debe ser animado (500ms de transición)

**Valores sugeridos para probar:**
- 50% - Vista panorámica completa
- 100% - Tamaño normal (default)
- 150% - Zoom moderado
- 200% - Máximo zoom

### 3. Filtro de Fuerza Mínima

**Pasos:**
1. Mueve el slider "Fuerza Mínima" de 0% a 100%
2. Las conexiones débiles deben desaparecer
3. Solo deben quedar conexiones con strength >= al valor seleccionado

**Verificar en consola:**
```
✂️  Filtro de fuerza 50%: 150 → 87 edges
```

**Nota:** El valor inicial ahora es 0% (antes era 20%) para mostrar todo por defecto.

### 4. Filtro de Tipos de Entidad

**Pasos:**
1. Click en uno o varios tipos de entidad:
   - Persona/Político (azul)
   - Organización (morado)
   - Medio (rojo)
   - Evento (verde)
   - POI (naranja)
2. Solo deben aparecer nodos del tipo seleccionado
3. Los botones seleccionados muestran un borde azul y marca ✓

**Verificar en consola:**
```
✂️  Filtro de tipos: 76 → 23 nodes
```

### 5. Filtro de Tipos de Relación

**Pasos:**
1. Selecciona uno o varios tipos de relación:
   - Propiedad (rojo)
   - Trabaja para (azul)
   - Afiliado con (morado)
   - Co-mención (gris)
   - Citado por (verde)
   - etc.
2. Solo deben aparecer conexiones del tipo seleccionado

**Verificar en consola:**
```
✂️  Filtro de relaciones: 150 → 45 edges
```

### 6. Nodos Aislados

**Pasos:**
1. Desmarca el checkbox "Mostrar nodos sin conexiones"
2. Los nodos sin conexiones deben desaparecer
3. Solo quedan nodos que tienen al menos una relación

**Verificar en consola:**
```
✂️  Filtro de aislados: 76 → 54 nodes
```

### 7. Resetear Filtros

**Pasos:**
1. Aplica varios filtros
2. Click en "Resetear Filtros"
3. Todo debe volver al estado inicial:
   - minStrength = 0
   - searchQuery = ""
   - zoomLevel = 100
   - selectedRelationTypes = []
   - selectedEntityTypes = []
   - showIsolatedNodes = true

## Logs de Debugging

Todos los filtros generan logs en la consola del navegador:

```javascript
🔍 Aplicando filtros: {minStrength: 50, selectedRelationTypes: ["owns"], ...}
📊 Datos del grafo: {totalNodes: 76, totalEdges: 150}
✂️  Filtro de fuerza 50%: 150 → 87 edges
✂️  Filtro de relaciones: 87 → 23 edges
✂️  Filtro de tipos: 76 → 45 nodes
✂️  Filtro de aislados: 45 → 42 nodes
🔎 Nodo encontrado: "José Raúl Mulino" (k173mg2...)
```

## Archivos Modificados

### 1. `GraphFilters.tsx`
- ✅ Agregado input de búsqueda con icono
- ✅ Agregado slider de zoom/dimensiones
- ✅ Cambiado `minStrength` inicial de 20 a 0
- ✅ Agregado texto de ayuda para búsqueda

### 2. `MediaGraph.tsx`
- ✅ Implementada lógica de filtrado con arrays spread
- ✅ Agregados logs detallados de cada filtro
- ✅ Agregado log de búsqueda (encontrado/no encontrado)
- ✅ Búsqueda case-insensitive con `toLowerCase()`

### 3. `NetworkGraph.tsx`
- ✅ Agregado efecto para centrar en nodo buscado
- ✅ Agregado efecto para controlar zoom programáticamente
- ✅ Animaciones suaves (1000ms para focus, 500ms para zoom)

### 4. `media-graph/page.tsx`
- ✅ Agregado estado inicial completo con searchQuery y zoomLevel
- ✅ Callbacks `onSearchEntity` y `onZoomChange` conectados

## Issues Conocidos (Resueltos)

### ✅ Issue 1: Filtros no funcionaban bien
**Causa:** `minStrength` inicial en 20 filtraba conexiones por defecto
**Solución:** Cambiado a 0 para mostrar todo inicialmente

### ✅ Issue 2: Mutación de arrays
**Causa:** Modificar arrays directamente causaba problemas de reactividad
**Solución:** Usar spread operator `[...array]` para crear copias

### ✅ Issue 3: Falta de feedback visual
**Causa:** No había indicadores de qué filtros estaban activos
**Solución:** Badge con contador en botón "Filtros", checkmarks en opciones seleccionadas

## Testing Exitoso ✓

Si todos los filtros funcionan correctamente, deberías poder:

1. ✅ Buscar "Mulino" y el grafo centra en José Raúl Mulino
2. ✅ Cambiar zoom a 150% y el grafo se agranda
3. ✅ Subir fuerza mínima a 60% y desaparecen conexiones débiles
4. ✅ Seleccionar solo "Persona" y solo aparecen políticos
5. ✅ Seleccionar solo "Trabaja para" y solo aparecen esas relaciones
6. ✅ Desmarcar nodos aislados y desaparecen entidades sin conexiones
7. ✅ Resetear y todo vuelve al estado inicial

## Próximos Pasos (Opcional)

- [ ] Agregar filtro de rango de fechas (firstMentioned - lastMentioned)
- [ ] Agregar filtro de mentionCount mínimo
- [ ] Guardar preferencias de filtros en localStorage
- [ ] Exportar vista filtrada a PNG/SVG
- [ ] Compartir URL con filtros aplicados (query params)

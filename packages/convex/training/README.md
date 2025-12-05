# 🤖 Sistema de Entrenamiento de IA - InfoPanama

## Descripción

Este directorio contiene los datos y configuraciones para entrenar la IA de fact-checking de InfoPanama.

## Archivos

### `panama_training_data.json`
**50 ejemplos reales** de verificaciones sobre Panamá, organizados por categorías:

- ✅ **Economía** (5 ejemplos)
- ✅ **Infraestructura** (4 ejemplos)
- ✅ **Política** (3 ejemplos)
- ✅ **Salud** (3 ejemplos)
- ✅ **Educación** (3 ejemplos)
- ✅ **Demografía** (3 ejemplos)
- ✅ **Transporte** (2 ejemplos)
- ✅ **Medio Ambiente** (3 ejemplos)
- ✅ **Seguridad** (2 ejemplos)
- ✅ **Corrupción** (2 ejemplos)
- ✅ **Cultura** (3 ejemplos)
- ✅ **Historia** (3 ejemplos)
- ✅ **Turismo** (2 ejemplos)
- ✅ **Tecnología** (2 ejemplos)
- ✅ **Deportes** (1 ejemplo)

### `fact_check_examples.json`
10 ejemplos detallados con análisis completo de:
- Veredicto (TRUE, FALSE, MIXED, NEEDS_CONTEXT, UNPROVEN)
- Nivel de confianza (0-100%)
- Análisis detallado
- Fuentes verificables
- Categoría temática

## Técnicas de Entrenamiento Implementadas

### 1. **Few-Shot Learning**
La IA recibe 6 ejemplos directamente en cada prompt para aprender patrones:
- 1 ejemplo FALSE (Economía)
- 1 ejemplo TRUE (Infraestructura)
- 1 ejemplo MIXED (Salud)
- 1 ejemplo NEEDS_CONTEXT (Educación)
- 1 ejemplo FALSE (Demografía)
- 1 ejemplo TRUE (Transporte)

### 2. **Chain-of-Thought Prompting**
La IA debe seguir un proceso paso a paso:
1. Identificar claim principal
2. Descomponer en subclaims
3. Evaluar evidencia pro/contra
4. Analizar credibilidad de fuentes
5. Considerar contexto crítico
6. Razonar lógicamente
7. Emitir veredicto con confianza

### 3. **Expertise Prompting**
La IA se presenta como experto en:
- Metodología IFCN (International Fact-Checking Network)
- Contexto político/social de Panamá
- Fuentes oficiales panameñas
- Patrones de desinformación local

### 4. **Red Flags Detection**
Entrenada para detectar señales de alerta:
- Lenguaje sensacionalista
- Falta de fuentes
- Cifras extraordinarias sin contexto
- Generalidades absolutas
- Teorías conspirativas

## Estructura de Veredictos

### TRUE (Verdadero) ✅
- Evidencia sólida y verificable
- Fuentes primarias confiables
- Datos coinciden con registros oficiales
- Confianza: 85-100%

### FALSE (Falso) ❌
- Contradice evidencia verificable
- Fuentes oficiales desmienten
- Datos fabricados/manipulados
- Confianza: 85-100%

### MIXED (Mixto) ◐
- Verdad parcial con omisiones
- Contexto correcto pero conclusión incorrecta
- Datos correctos pero interpretación sesgada
- Confianza: 70-100%

### UNPROVEN (No Comprobado) ❓
- Insuficiente evidencia disponible
- Fuentes contradictorias
- Datos no publicados oficialmente
- Confianza: <50%

### NEEDS_CONTEXT (Necesita Contexto) ⚠️
- Técnicamente cierto pero engañoso
- Estadísticas reales usadas incorrectamente
- Verdad que oculta información importante
- Confianza: Variable

## Fuentes Priorizadas

### Nivel 1 - Fuentes Oficiales Primarias
- Gaceta Oficial de Panamá
- Sitios .gob.pa
- Contraloría General
- INEC (Instituto Nacional de Estadística)
- Tribunal Electoral
- ACP (Autoridad del Canal)

### Nivel 2 - Instituciones Reconocidas
- Universidades (UP, UTP, USMA)
- ONGs establecidas
- ONU, OEA, BID, Banco Mundial

### Nivel 3 - Medios Verificables
- La Prensa
- La Estrella de Panamá
- TVN, Telemetro

### Nivel 4 - Expertos
- Académicos reconocidos
- Profesionales con credenciales verificables

## Patrones de Desinformación en Panamá

La IA está entrenada para reconocer:

1. **Promesas sin plazos realistas**
2. **Estadísticas descontextualizadas** (criminalidad, economía)
3. **Costos inflados/deflacionados** de infraestructura
4. **Manipulación de cifras** de empleo
5. **Rumores sobre la CSS** sin base oficial
6. **Confusión entre ley y ejecución** (ej: inversión en educación)

## Métricas de Calidad

Para cada verificación, la IA debe proporcionar:

- ✅ **Veredicto claro** (TRUE/FALSE/MIXED/UNPROVEN/NEEDS_CONTEXT)
- ✅ **Confidence Score** (0-100%)
- ✅ **Summary** (1-2 oraciones ejecutivas)
- ✅ **Explanation** (análisis detallado con razonamiento)
- ✅ **Key Points** (3-5 puntos clave con evidencia)
- ✅ **Evidence** (fuentes clasificadas por tipo y confiabilidad)
- ✅ **Context** (información adicional relevante)
- ✅ **Red Flags** (señales de alerta detectadas)
- ✅ **Related Claims** (afirmaciones relacionadas a verificar)

## Uso

Los datos de este directorio alimentan:

1. **`convex/lib/prompts.ts`** - Sistema de prompts con ejemplos
2. **`convex/verification.ts`** - Motor de verificación con OpenAI
3. **Panel Admin** - Interfaz de revisión humana

## Expansión Futura

Para mejorar el entrenamiento:

1. **Agregar más ejemplos** (objetivo: 100+ ejemplos)
2. **Casos edge** (afirmaciones ambiguas, multi-interpretación)
3. **Ejemplos con imágenes** manipuladas
4. **Claims de redes sociales** (WhatsApp, Facebook, Twitter)
5. **Fine-tuning** del modelo GPT específico para Panamá
6. **Feedback loop** de verificaciones aprobadas/rechazadas por editores

## Licencia

Datos de entrenamiento basados en información pública verificable.
Fuentes citadas mantienen sus respectivos derechos.

---

**Última actualización**: 2024-11-29
**Versión**: 1.0
**Mantenedor**: InfoPanama Team

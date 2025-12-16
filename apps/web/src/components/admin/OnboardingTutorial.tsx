'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
  route: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  // ============= BIENVENIDA Y DASHBOARD =============
  {
    id: 'welcome',
    title: '¡Bienvenido a VerificaPty Admin! 👋',
    description: 'Este es tu panel de control para verificar información y combatir la desinformación en Panamá. Te mostraré todas las herramientas disponibles paso a paso.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'dashboard-stats',
    title: 'Métricas del Sistema',
    description: 'Aquí ves las estadísticas clave: total de verificaciones realizadas, investigaciones activas, publicaciones y alertas de alto riesgo que requieren atención inmediata.',
    targetSelector: '[data-tutorial="dashboard-stats"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= VERIFICACIONES - SECCIÓN PRINCIPAL =============
  {
    id: 'claims-intro',
    title: 'Sección de Verificaciones',
    description: 'Esta es tu área de trabajo principal. Aquí gestionas todas las afirmaciones detectadas por el crawler que necesitan ser verificadas.',
    targetSelector: '[data-tutorial="claims-title"]',
    position: 'bottom',
    route: '/admin/dashboard/claims',
  },
  {
    id: 'claims-list',
    title: 'Lista de Verificaciones',
    description: 'Cada claim muestra su estado (Nueva, Investigando, En Revisión, Publicada), veredicto, nivel de riesgo y fecha. Haz click en cualquiera para revisarla en detalle.',
    targetSelector: '[data-tutorial="claims-list"]',
    position: 'bottom',
    route: '/admin/dashboard/claims',
  },
  {
    id: 'claims-search',
    title: 'Búsqueda de Verificaciones',
    description: 'Busca rápidamente por palabras clave, nombre del actor, fuente, tema o ID. Ejemplo: "Mulino", "economía", "Hombres de Blanco".',
    targetSelector: '[data-tutorial="claims-search"]',
    position: 'bottom',
    route: '/admin/dashboard/claims',
  },
  {
    id: 'claims-filters-status',
    title: 'Filtro por Estado',
    description: 'Filtra las verificaciones por su estado actual: Nueva (recién detectada), Investigando (en proceso), En Revisión (esperando aprobación), o Publicada (ya visible al público).',
    targetSelector: '[data-tutorial="claims-status-filter"]',
    position: 'bottom',
    route: '/admin/dashboard/claims',
  },
  {
    id: 'claims-filters-risk',
    title: 'Filtro por Nivel de Riesgo',
    description: 'Prioriza tu trabajo filtrando por nivel de riesgo: Crítico (impacto masivo), Alto (requiere atención urgente), Medio, o Bajo.',
    targetSelector: '[data-tutorial="claims-risk-filter"]',
    position: 'bottom',
    route: '/admin/dashboard/claims',
  },

  // ============= ACTORES =============
  {
    id: 'actors-intro',
    title: 'Gestión de Actores',
    description: 'Administra la base de datos de políticos, instituciones, medios de comunicación y organizaciones cuyas declaraciones son monitoreadas y verificadas.',
    targetSelector: '[data-tutorial="actors-title"]',
    position: 'bottom',
    route: '/admin/dashboard/actores',
  },
  {
    id: 'actors-list',
    title: 'Perfiles de Actores',
    description: 'Cada actor tiene un perfil completo con: tipo (político/institución/medio), cargo, historial de verificaciones, porcentaje de veracidad y conexiones con otros actores.',
    targetSelector: '[data-tutorial="actors-list"]',
    position: 'bottom',
    route: '/admin/dashboard/actores',
  },
  {
    id: 'actors-new',
    title: 'Agregar Nuevo Actor',
    description: 'Registra nuevos actores cuando aparezcan en noticias. Incluye: nombre completo, tipo, cargo/posición, partido político (si aplica) y nivel de credibilidad inicial.',
    targetSelector: '[data-tutorial="new-actor-button"]',
    position: 'left',
    route: '/admin/dashboard/actores',
  },

  // ============= FUENTES =============
  {
    id: 'sources-intro',
    title: 'Fuentes de Información',
    description: 'Gestiona todos los medios de comunicación y fuentes oficiales que el sistema monitorea automáticamente para detectar nuevas afirmaciones.',
    targetSelector: '[data-tutorial="sources-title"]',
    position: 'bottom',
    route: '/admin/dashboard/fuentes',
  },
  {
    id: 'sources-list',
    title: 'Lista de Fuentes',
    description: 'Cada fuente muestra: tipo (Medio/Oficial), score de credibilidad (0-100%), cantidad de artículos scrapeados, última actualización y estado de confiabilidad.',
    targetSelector: '[data-tutorial="sources-list"]',
    position: 'bottom',
    route: '/admin/dashboard/fuentes',
  },
  {
    id: 'sources-new',
    title: 'Agregar Nueva Fuente',
    description: 'Agrega nuevos medios o fuentes oficiales para que el crawler las monitoree. Define si es confiable, su score de credibilidad y la URL a scrapear.',
    targetSelector: '[data-tutorial="new-source-button"]',
    position: 'left',
    route: '/admin/dashboard/fuentes',
  },

  // ============= GRAFO DE MEDIOS =============
  {
    id: 'media-graph-intro',
    title: 'Grafo de Conexiones',
    description: 'Visualización interactiva de las relaciones entre actores, medios, eventos y verificaciones. Descubre patrones, narrativas compartidas y redes de influencia.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard/media-graph',
  },

  // ============= NAVEGACIÓN DEL SIDEBAR =============
  {
    id: 'sidebar-nav',
    title: 'Navegación Principal',
    description: 'Usa este menú para moverte entre secciones: Dashboard (resumen), Verificaciones (trabajo diario), Grafo de Medios (análisis visual), Actores y Fuentes.',
    targetSelector: 'nav',
    position: 'right',
    route: '/admin/dashboard',
  },

  // ============= WORKFLOW COMPLETO =============
  {
    id: 'workflow-overview',
    title: 'Flujo de Trabajo Completo',
    description: 'Proceso: 1) El crawler detecta afirmaciones en medios → 2) Sistema de IA analiza y genera veredicto preliminar → 3) Tú revisas, editas y apruebas → 4) Se publica en el sitio público. ¡Así mantenemos informada a la ciudadanía!',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= FUNCIONALIDADES AVANZADAS =============
  {
    id: 'ai-verification',
    title: 'Verificación con IA',
    description: 'Cada claim puede ser verificada automáticamente con inteligencia artificial. El sistema busca evidencia, analiza fuentes, detecta señales de alerta y genera un veredicto preliminar con nivel de confianza.',
    targetSelector: '[data-tutorial="dashboard-stats"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'risk-levels',
    title: 'Niveles de Riesgo',
    description: 'El sistema asigna niveles de riesgo basados en: alcance del actor, gravedad de la afirmación, impacto potencial y velocidad de viralización. Esto te ayuda a priorizar.',
    targetSelector: '[data-tutorial="dashboard-stats"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'states-workflow',
    title: 'Estados del Workflow',
    description: 'Nueva → Investigando (agregando evidencia) → En Revisión (esperando aprobación de supervisor) → Aprobada (lista para publicar) → Publicada (visible al público).',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= BUENAS PRÁCTICAS =============
  {
    id: 'best-practices-1',
    title: 'Buenas Prácticas: Verificación',
    description: 'Siempre verifica con múltiples fuentes, busca fuentes primarias (documentos oficiales, datos públicos), cross-check con sitios confiables y documenta cada evidencia encontrada.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'best-practices-2',
    title: 'Buenas Prácticas: Imparcialidad',
    description: 'Mantén objetividad: no dejes que tus preferencias políticas influyan en el veredicto. Base tus decisiones SOLO en evidencia verificable y fuentes confiables.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'best-practices-3',
    title: 'Buenas Prácticas: Transparencia',
    description: 'Siempre explica tu razonamiento en el análisis. Los ciudadanos deben poder entender POR QUÉ llegaste a ese veredicto. La transparencia genera confianza.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= RECURSOS Y AYUDA =============
  {
    id: 'resources',
    title: 'Recursos Útiles',
    description: 'Fuentes verificables: Gaceta Oficial, INEC, Contraloría, MEF, páginas oficiales de instituciones, bases de datos públicas, informes de organismos internacionales.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'priority-tips',
    title: 'Priorización de Trabajo',
    description: 'Enfócate primero en: Claims de alto riesgo → Actores con mucho alcance → Temas de salud pública o economía → Claims viralizándose rápidamente.',
    targetSelector: '[data-tutorial="dashboard-stats"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= CASOS ESPECIALES =============
  {
    id: 'special-cases',
    title: 'Casos Especiales',
    description: 'Afirmaciones de opinión: marca como "NO VERIFICABLE". Sátira o humor: marca contexto. Afirmaciones compuestas (mezcla verdad/mentira): desglosa en partes separadas.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
  {
    id: 'context-matters',
    title: 'La Importancia del Contexto',
    description: 'Una afirmación puede ser técnicamente cierta pero engañosa sin contexto. Siempre proporciona el contexto completo: fechas, cifras exactas, comparaciones relevantes.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= IMPACTO Y MISIÓN =============
  {
    id: 'impact',
    title: 'Tu Impacto',
    description: 'Cada verificación que publicas ayuda a ciudadanos a tomar decisiones informadas, reduce la desinformación, promueve la transparencia y fortalece la democracia panameña.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },

  // ============= COMPLETADO =============
  {
    id: 'complete',
    title: '¡Tutorial Completado! 🎉',
    description: 'Ya conoces todas las herramientas del sistema. ¡Es hora de empezar a verificar información y combatir la desinformación! Recuerda: objetividad, evidencia y transparencia son tus pilares.',
    targetSelector: '[data-tutorial="dashboard-title"]',
    position: 'bottom',
    route: '/admin/dashboard',
  },
]

const STORAGE_KEY = 'infopanama-tutorial-completed'
const STEP_STORAGE_KEY = 'infopanama-tutorial-step'

export default function OnboardingTutorial() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isNavigating, setIsNavigating] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const step = TUTORIAL_STEPS[currentStep]

  // Función para esperar a que un elemento esté disponible en el DOM
  const waitForElement = useCallback((selector: string, maxAttempts = 20): Promise<Element | null> => {
    return new Promise((resolve) => {
      let attempts = 0

      const checkElement = () => {
        const element = document.querySelector(selector)

        if (element) {
          resolve(element)
          return
        }

        attempts++

        if (attempts >= maxAttempts) {
          console.warn(`[Tutorial] No se encontró el elemento: ${selector}`)
          resolve(null)
          return
        }

        // Aumentar el tiempo de espera progresivamente
        const delay = Math.min(100 + (attempts * 50), 500)
        setTimeout(checkElement, delay)
      }

      checkElement()
    })
  }, [])

  // Actualizar posición del spotlight
  const updateTargetPosition = useCallback(async () => {
    if (!step) return

    const target = await waitForElement(step.targetSelector)

    if (target) {
      const rect = target.getBoundingClientRect()
      setTargetPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })

      // Scroll suave al elemento
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Animar cursor al target
      animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2)

      setRetryCount(0) // Reset retry counter on success
    } else {
      // Reintentar una vez más si falla
      if (retryCount < 1) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => updateTargetPosition(), 1000)
      }
    }
  }, [step, waitForElement, retryCount])

  // Animar cursor
  const animateCursor = useCallback((targetX: number, targetY: number) => {
    const duration = 1500
    const startX = cursorPosition.x || window.innerWidth / 2
    const startY = cursorPosition.y || window.innerHeight / 2
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const x = startX + (targetX - startX) * easeProgress
      const y = startY + (targetY - startY) * easeProgress

      setCursorPosition({ x, y })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [cursorPosition])

  // Inicializar tutorial
  useEffect(() => {
    console.log('🎓 [Tutorial] Componente montado')

    // ⚠️ MODO FORZADO: Tutorial siempre visible (para testing/review)
    // Ignora completamente localStorage y siempre muestra el tutorial
    console.log('🎓 [Tutorial] MODO FORZADO - Siempre se mostrará')

    const timer = setTimeout(() => {
      console.log('🎓 [Tutorial] Mostrando tutorial...')
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)

    // CÓDIGO ORIGINAL (comentado - descomentar para comportamiento normal):
    // const completed = localStorage.getItem(STORAGE_KEY)
    // console.log('🎓 [Tutorial] Completado:', completed)
    //
    // if (completed === 'true') {
    //   console.log('🎓 [Tutorial] Ya completado, no se mostrará')
    //   setIsVisible(false)
    //   return
    // }
    //
    // const savedStep = localStorage.getItem(STEP_STORAGE_KEY)
    // console.log('🎓 [Tutorial] Paso guardado:', savedStep)
    //
    // if (savedStep) {
    //   const stepIndex = parseInt(savedStep, 10)
    //   if (!isNaN(stepIndex) && stepIndex < TUTORIAL_STEPS.length) {
    //     setCurrentStep(stepIndex)
    //     console.log('🎓 [Tutorial] Restaurando paso:', stepIndex)
    //   }
    // }
    //
    // const timer = setTimeout(() => {
    //   console.log('🎓 [Tutorial] Mostrando tutorial...')
    //   setIsVisible(true)
    // }, 500)
    //
    // return () => clearTimeout(timer)
  }, [])

  // Actualizar posición cuando cambia la ruta o el paso
  useEffect(() => {
    if (!isVisible || !step || isNavigating) return

    // Verificar si estamos en la ruta correcta
    if (pathname !== step.route) {
      return
    }

    // Esperar a que el componente se renderice completamente
    const timer = setTimeout(() => {
      updateTargetPosition()
    }, 800)

    return () => clearTimeout(timer)
  }, [currentStep, isVisible, step, pathname, isNavigating, updateTargetPosition])

  // Manejar cambios de ruta
  useEffect(() => {
    if (isNavigating && pathname === step?.route) {
      // Llegamos a la ruta destino
      setIsNavigating(false)
    }
  }, [pathname, step, isNavigating])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1
      const nextStep = TUTORIAL_STEPS[nextStepIndex]

      // Guardar paso en localStorage
      localStorage.setItem(STEP_STORAGE_KEY, nextStepIndex.toString())

      // Si necesitamos cambiar de ruta
      if (nextStep.route !== pathname) {
        setIsNavigating(true)
        router.push(nextStep.route)
      }

      // Actualizar paso
      setCurrentStep(nextStepIndex)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.removeItem(STEP_STORAGE_KEY)
    setIsVisible(false)
  }

  const getTooltipPosition = () => {
    const tooltipWidth = 400
    const tooltipHeight = 250
    const offset = 20
    const padding = 20 // Padding desde los bordes de la pantalla

    let position = { top: 0, left: 0 }

    switch (step?.position) {
      case 'top':
        position = {
          top: targetPosition.top - tooltipHeight - offset,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2,
        }
        break
      case 'bottom':
        position = {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2,
        }
        break
      case 'left':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          left: targetPosition.left - tooltipWidth - offset,
        }
        break
      case 'right':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          left: targetPosition.left + targetPosition.width + offset,
        }
        break
      default:
        position = {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left,
        }
    }

    // Ajustar si se sale de la pantalla
    if (position.left < padding) {
      position.left = padding
    } else if (position.left + tooltipWidth > window.innerWidth - padding) {
      position.left = window.innerWidth - tooltipWidth - padding
    }

    if (position.top < padding) {
      position.top = padding
    } else if (position.top + tooltipHeight > window.innerHeight - padding) {
      position.top = window.innerHeight - tooltipHeight - padding
    }

    return position
  }

  if (!isVisible || !step) return null

  const tooltipStyle = getTooltipPosition()

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300"
        style={{ pointerEvents: 'none' }}
      />

      {/* Spotlight en el elemento objetivo */}
      {targetPosition.width > 0 && (
        <div
          className="fixed z-[9999] transition-all duration-500 ease-out"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            pointerEvents: 'none',
          }}
        >
          <div className="absolute inset-0 animate-pulse ring-4 ring-blue-500/50 rounded-xl" />
        </div>
      )}

      {/* Cursor animado */}
      <div
        className="fixed z-[10001] pointer-events-none transition-all duration-200"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-4px, -4px)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
            fill="#3B82F6"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tooltip del tutorial */}
      <div
        className="fixed z-[10000] bg-white rounded-xl shadow-2xl p-6 transition-all duration-300"
        style={{
          ...tooltipStyle,
          width: '400px',
          animation: 'fadeInScale 0.3s ease-out',
        }}
      >
        {/* Botón de cerrar */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar tutorial"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Contenido */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
              Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            Saltar tutorial
          </button>

          <button
            onClick={handleNext}
            disabled={isNavigating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNavigating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
